using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OficinaMecanica.Api.Services;
using OficinaMecanica.Application.DTOs.TwoFactor;
using OficinaMecanica.Application.DTOs.Usuario;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // Recuperação de senha
    // (a validade do e-mail em TwoFactorService diz "10 minutos": mantenha os dois iguais)
    private const int RecuperacaoSenhaValidadeMinutos = 10;
    private const int RecuperacaoSenhaIntervaloSegundos = 60;
    private const int RecuperacaoSenhaMaxTentativas = 5;
    private const int SenhaTamanhoMinimo = 6;

    private readonly OficinaDbContext _context;
    private readonly PasswordHasher<Usuario> _passwordHasher;
    private readonly JwtService _jwtService;
    private readonly TwoFactorService _twoFactorService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        OficinaDbContext context,
        JwtService jwtService,
        TwoFactorService twoFactorService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<Usuario>();
        _jwtService = jwtService;
        _twoFactorService = twoFactorService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(UsuarioCadastroDto dto)
    {
        var email = dto.Email.Trim().ToLower();

        var emailExiste = await _context.Usuario
            .AnyAsync(u => u.Email == email);

        if (emailExiste)
        {
            return BadRequest(
                "Já existe um usuário cadastrado com este e-mail."
            );
        }

        var usuario = new Usuario
        {
            Nome = dto.Nome,
            Email = email,
            DataCadastro = DateTime.UtcNow,
            Ativo = true,

            EmailVerificado = false,

            EmailVerificationAttempts = 0
        };

        usuario.SenhaHash = _passwordHasher.HashPassword(
            usuario,
            dto.Senha
        );

        var codigo = _twoFactorService.GerarCodigo();

        var tokenVerificacao =
            _twoFactorService.GerarTokenTemporario();

        usuario.EmailVerificationCodeHash =
            _twoFactorService.GerarHash(codigo);

        usuario.EmailVerificationCodeExpiresAt =
            DateTime.UtcNow.AddMinutes(5);

        usuario.EmailVerificationToken =
            tokenVerificacao;

        usuario.EmailVerificationTokenExpiresAt =
            DateTime.UtcNow.AddMinutes(5);

        _context.Usuario.Add(usuario);

        await _context.SaveChangesAsync();

        await _twoFactorService.EnviarCodigoVerificacaoEmailAsync(
            usuario.Email,
            codigo
        );

        return Ok(new
        {
            requiresEmailVerification = true,
            verificationToken = tokenVerificacao,
            mensagem = "Um código de verificação foi enviado para o seu e-mail."
        });
    }


    [HttpPost("register/verify")]
    public async Task<IActionResult> VerifyEmail(
    TwoFactorVerifyDto dto)
    {
        var usuario = await _context.Usuario
            .FirstOrDefaultAsync(
                u => u.EmailVerificationToken == dto.TwoFactorToken
            );

        if (usuario == null)
        {
            return Unauthorized(new
            {
                mensagem = "Token de verificação inválido."
            });
        }

        if (usuario.EmailVerificado)
        {
            return BadRequest(new
            {
                mensagem = "Este e-mail já foi verificado."
            });
        }

        if (!usuario.EmailVerificationTokenExpiresAt.HasValue ||
            usuario.EmailVerificationTokenExpiresAt.Value < DateTime.UtcNow)
        {
            return Unauthorized(new
            {
                mensagem = "O token de verificação expirou."
            });
        }

        if (!usuario.EmailVerificationCodeExpiresAt.HasValue ||
            usuario.EmailVerificationCodeExpiresAt.Value < DateTime.UtcNow)
        {
            return Unauthorized(new
            {
                mensagem = "O código de verificação expirou."
            });
        }

        if (usuario.EmailVerificationAttempts >= 5)
        {
            return Unauthorized(new
            {
                mensagem = "Número máximo de tentativas excedido."
            });
        }

        usuario.EmailVerificationAttempts++;

        var codigoValido = _twoFactorService.ValidarCodigo(
            dto.Code,
            usuario.EmailVerificationCodeHash!
        );

        if (!codigoValido)
        {
            await _context.SaveChangesAsync();

            return Unauthorized(new
            {
                mensagem = "Código de verificação inválido."
            });
        }

        // E-mail confirmado
        usuario.EmailVerificado = true;

        usuario.EmailVerificationCodeHash = null;
        usuario.EmailVerificationCodeExpiresAt = null;
        usuario.EmailVerificationAttempts = 0;
        usuario.EmailVerificationToken = null;
        usuario.EmailVerificationTokenExpiresAt = null;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensagem = "E-mail verificado com sucesso."
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(UsuarioLoginDto dto)
    {
        var usuario = await _context.Usuario
            .FirstOrDefaultAsync(
                u => u.Email == dto.Email.Trim().ToLower()
            );

        if (usuario == null)
        {
            return Unauthorized(new
            {
                mensagem = "E-mail ou senha inválidos."
            });
        }

        var resultado = _passwordHasher.VerifyHashedPassword(
         usuario,
         usuario.SenhaHash,
         dto.Senha
     );

        if (resultado == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new
            {
                mensagem = "E-mail ou senha inválidos."
            });
        }

        if (!usuario.EmailVerificado)
        {
            return Unauthorized(new
            {
                mensagem = "Seu e-mail ainda não foi verificado."
            });
        }

        // Se o 2FA estiver ativado, não gera o JWT ainda
        if (usuario.TwoFactorEnabled)
        {
            var codigo = _twoFactorService.GerarCodigo();

            var twoFactorToken =
                _twoFactorService.GerarTokenTemporario();

            usuario.TwoFactorCodeHash =
                _twoFactorService.GerarHash(codigo);

            usuario.TwoFactorCodeExpiresAt =
                DateTime.UtcNow.AddMinutes(5);

            usuario.TwoFactorAttempts = 0;

            usuario.TwoFactorToken = twoFactorToken;

            usuario.TwoFactorTokenExpiresAt =
                DateTime.UtcNow.AddMinutes(5);

            await _context.SaveChangesAsync();

            // Envia o código de verificação por e-mail
            await _twoFactorService.EnviarCodigoPorEmailAsync(
                usuario.Email,
                codigo
            );

            return Ok(new
            {
                requiresTwoFactor = true,
                twoFactorToken,
                mensagem = "Um código de verificação foi enviado para o seu e-mail."
            });
        }

        // Fluxo normal quando o 2FA está desativado
        var token = _jwtService.GerarToken(usuario);

        return Ok(new
        {
            mensagem = "Login realizado com sucesso.",
            token,
            usuarioId = usuario.Id,
            nome = usuario.Nome,
            email = usuario.Email
        });
    }

    // =====================================================
    // RECUPERAÇÃO DE SENHA
    // =====================================================

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(EsqueciSenhaDto dto)
    {
        var email = dto.Email?.Trim().ToLower() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(email))
        {
            return BadRequest(new
            {
                mensagem = "Informe o e-mail."
            });
        }

        // Mesma resposta exista a conta ou não, para não revelar quem está cadastrado
        var respostaGenerica = new
        {
            mensagem = "Se o e-mail estiver cadastrado, enviaremos um código de recuperação."
        };

        var usuario = await _context.Usuario
            .FirstOrDefaultAsync(u => u.Email == email);

        if (usuario == null || !usuario.Ativo)
        {
            return Ok(respostaGenerica);
        }

        // Intervalo mínimo entre pedidos (evita disparar vários e-mails seguidos)
        if (usuario.PasswordResetCodeExpiresAt.HasValue)
        {
            var geradoEm = usuario.PasswordResetCodeExpiresAt.Value
                .AddMinutes(-RecuperacaoSenhaValidadeMinutos);

            if (DateTime.UtcNow < geradoEm.AddSeconds(RecuperacaoSenhaIntervaloSegundos))
            {
                return Ok(respostaGenerica);
            }
        }

        var codigo = _twoFactorService.GerarCodigo();

        // Um novo código substitui o anterior
        usuario.PasswordResetCodeHash =
            _twoFactorService.GerarHash(codigo);

        usuario.PasswordResetCodeExpiresAt =
            DateTime.UtcNow.AddMinutes(RecuperacaoSenhaValidadeMinutos);

        usuario.PasswordResetAttempts = 0;

        await _context.SaveChangesAsync();

        try
        {
            await _twoFactorService.EnviarCodigoRecuperacaoSenhaAsync(
                usuario.Email,
                codigo
            );
        }
        catch (Exception ex)
        {
            // Não deixa a falha de envio revelar que a conta existe
            _logger.LogError(ex, "Falha ao enviar o e-mail de recuperação de senha.");
        }

        return Ok(respostaGenerica);
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(RedefinirSenhaDto dto)
    {
        var email = dto.Email?.Trim().ToLower() ?? string.Empty;
        var codigo = dto.Code?.Trim() ?? string.Empty;
        var novaSenha = dto.NovaSenha ?? string.Empty;

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(codigo) ||
            string.IsNullOrEmpty(novaSenha))
        {
            return BadRequest(new
            {
                mensagem = "Informe o e-mail, o código e a nova senha."
            });
        }

        if (novaSenha.Length < SenhaTamanhoMinimo)
        {
            return BadRequest(new
            {
                mensagem = $"A senha deve ter pelo menos {SenhaTamanhoMinimo} caracteres."
            });
        }

        // Mesma mensagem para conta inexistente, código errado ou expirado
        var codigoInvalido = new
        {
            mensagem = "Código inválido ou expirado."
        };

        var usuario = await _context.Usuario
            .FirstOrDefaultAsync(u => u.Email == email);

        if (usuario == null ||
            string.IsNullOrEmpty(usuario.PasswordResetCodeHash) ||
            !usuario.PasswordResetCodeExpiresAt.HasValue ||
            usuario.PasswordResetCodeExpiresAt.Value < DateTime.UtcNow)
        {
            return BadRequest(codigoInvalido);
        }

        if (usuario.PasswordResetAttempts >= RecuperacaoSenhaMaxTentativas)
        {
            return BadRequest(new
            {
                mensagem = "Número máximo de tentativas excedido. Solicite um novo código."
            });
        }

        usuario.PasswordResetAttempts++;

        var codigoValido = _twoFactorService.ValidarCodigo(
            codigo,
            usuario.PasswordResetCodeHash
        );

        if (!codigoValido)
        {
            await _context.SaveChangesAsync();

            return BadRequest(codigoInvalido);
        }

        // Código correto: troca a senha e inutiliza o código (uso único)
        usuario.SenhaHash = _passwordHasher.HashPassword(
            usuario,
            novaSenha
        );

        usuario.PasswordResetCodeHash = null;
        usuario.PasswordResetCodeExpiresAt = null;
        usuario.PasswordResetAttempts = 0;

        // Receber o código no e-mail comprova que a pessoa controla a caixa de entrada.
        // Sem isso, quem se cadastrou e não verificou o e-mail ficaria sem conseguir entrar.
        if (!usuario.EmailVerificado)
        {
            usuario.EmailVerificado = true;
            usuario.EmailVerificationCodeHash = null;
            usuario.EmailVerificationCodeExpiresAt = null;
            usuario.EmailVerificationAttempts = 0;
            usuario.EmailVerificationToken = null;
            usuario.EmailVerificationTokenExpiresAt = null;
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensagem = "Senha redefinida com sucesso."
        });
    }

    [Authorize]
    [HttpPost("2fa/enable")]
    public async Task<IActionResult> EnableTwoFactor()
    {
        var usuarioIdClaim = User.FindFirst(
            System.Security.Claims.ClaimTypes.NameIdentifier
        );

        if (usuarioIdClaim == null)
        {
            return Unauthorized(new
            {
                mensagem = "Usuário não autenticado."
            });
        }

        if (!int.TryParse(usuarioIdClaim.Value, out var usuarioId))
        {
            return Unauthorized(new
            {
                mensagem = "Usuário inválido."
            });
        }

        var usuario = await _context.Usuario
            .FirstOrDefaultAsync(u => u.Id == usuarioId);

        if (usuario == null)
        {
            return NotFound(new
            {
                mensagem = "Usuário não encontrado."
            });
        }

        if (usuario.TwoFactorEnabled)
        {
            return BadRequest(new
            {
                mensagem = "A autenticação de dois fatores já está ativada."
            });
        }

        usuario.TwoFactorEnabled = true;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            mensagem = "Autenticação de dois fatores ativada com sucesso."
        });
    }

    [HttpPost("2fa/verify")]
    public async Task<IActionResult> VerifyTwoFactor(
        TwoFactorVerifyDto dto)
    {
        var usuario = await _context.Usuario
            .FirstOrDefaultAsync(
                u => u.TwoFactorToken == dto.TwoFactorToken
            );

        if (usuario == null)
        {
            return Unauthorized(new
            {
                mensagem = "Token de autenticação inválido."
            });
        }

        if (!usuario.TwoFactorTokenExpiresAt.HasValue ||
            usuario.TwoFactorTokenExpiresAt.Value < DateTime.UtcNow)
        {
            return Unauthorized(new
            {
                mensagem = "O token de autenticação expirou."
            });
        }

        if (!usuario.TwoFactorCodeExpiresAt.HasValue ||
            usuario.TwoFactorCodeExpiresAt.Value < DateTime.UtcNow)
        {
            return Unauthorized(new
            {
                mensagem = "O código de verificação expirou."
            });
        }

        if (usuario.TwoFactorAttempts >= 5)
        {
            return Unauthorized(new
            {
                mensagem = "Número máximo de tentativas excedido."
            });
        }

        usuario.TwoFactorAttempts++;

        var codigoValido = _twoFactorService.ValidarCodigo(
            dto.Code,
            usuario.TwoFactorCodeHash!
        );

        if (!codigoValido)
        {
            await _context.SaveChangesAsync();

            return Unauthorized(new
            {
                mensagem = "Código de verificação inválido."
            });
        }

        // Código válido: limpa o desafio
        usuario.TwoFactorCodeHash = null;
        usuario.TwoFactorCodeExpiresAt = null;
        usuario.TwoFactorAttempts = 0;
        usuario.TwoFactorToken = null;
        usuario.TwoFactorTokenExpiresAt = null;

        await _context.SaveChangesAsync();

        // Agora sim podemos gerar o JWT
        var token = _jwtService.GerarToken(usuario);

        return Ok(new
        {
            mensagem = "Autenticação realizada com sucesso.",
            token,
            usuarioId = usuario.Id,
            nome = usuario.Nome,
            email = usuario.Email
        });
    }
}
