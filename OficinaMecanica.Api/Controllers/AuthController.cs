using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Api.Services;
using OficinaMecanica.Application.DTOs.Usuario;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly OficinaDbContext _context;
    private readonly PasswordHasher<Usuario> _passwordHasher;
    private readonly JwtService _jwtService;

    public AuthController(
        OficinaDbContext context,
        JwtService jwtService)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<Usuario>();
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(UsuarioCadastroDto dto)
    {
        var emailExiste = await _context.Usuario
            .AnyAsync(u => u.Email == dto.Email.Trim().ToLower());

        if (emailExiste)
        {
            return BadRequest(
                "Já existe um usuário cadastrado com este e-mail."
            );
        }

        var usuario = new Usuario
        {
            Nome = dto.Nome,
            Email = dto.Email.Trim().ToLower(),
            DataCadastro = DateTime.UtcNow,
            Ativo = true
        };

        usuario.SenhaHash = _passwordHasher.HashPassword(
            usuario,
            dto.Senha
        );

        _context.Usuario.Add(usuario);

        await _context.SaveChangesAsync();

        return NoContent();
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

        var token = _jwtService.GerarToken(usuario);

        return StatusCode(200, new
        {
            mensagem = "Login realizado com sucesso.",
            token,
            usuarioId = usuario.Id,
            nome = usuario.Nome,
            email = usuario.Email
        });
    }
}