using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Api.Security;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.DTOs.Mecanico;
using OficinaMecanica.Application.Exceptions;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Domain.Entities;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MecanicoController : ControllerBase
{
    private readonly MecanicoAppService _service;
    private readonly OficinaAppService _oficinaService;
    private readonly EscopoMecanicoService _escopo;

    public MecanicoController(
        MecanicoAppService service,
        OficinaAppService oficinaService,
        EscopoMecanicoService escopo)
    {
        _service = service;
        _oficinaService = oficinaService;
        _escopo = escopo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var mecanicos = await _service.GetAllAsync(
            oficina.Id
        );

        // Todos os perfis consultam a lista (produtividade); só o Admin altera cadastros
        await _escopo.ObterMecanicoRestritoAsync(User.GetUsuarioId());

        return Ok(mecanicos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var escopo = await _escopo.ObterMecanicoRestritoAsync(User.GetUsuarioId());

        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var mecanico = await _service.GetByIdAsync(
            id,
            oficina.Id
        );

        if (mecanico == null)
            return NotFound();

        if (escopo.HasValue)
        {
            // Indicadores financeiros nunca vão para o mecânico
            mecanico.TotalMaoObra = 0;

            // Consulta indicadores de qualquer mecânico, mas as OS listadas são só as dele
            if (mecanico.Id != escopo.Value)
                mecanico.OrdensServico = new();
        }

        return Ok(mecanico);
    }

    [HttpPost]
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> Create(
        MecanicoRequestDto dto)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var criado = await _service.CreateAsync(
            dto,
            oficina.Id
        );

        return CreatedAtAction(
            nameof(GetById),
            new { id = criado.Id },
            criado
        );
    }

    [HttpPut("{id}")]
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> Update(
        Guid id,
        MecanicoRequestDto dto)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var atualizado = await _service.UpdateAsync(
            id,
            dto,
            oficina.Id
        );

        if (!atualizado)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("{id}/inativar")]
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> Inativar(Guid id)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        await _service.InativarAsync(
            id,
            oficina.Id
        );

        return NoContent();
    }

    [HttpPatch("{id}/reativar")]
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> Reativar(Guid id)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        await _service.ReativarAsync(
            id,
            oficina.Id
        );

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var removido = await _service.DeleteAsync(
            id,
            oficina.Id
        );

        if (!removido)
            return NotFound();

        return NoContent();
    }

    [HttpPost("{id}/vincular-usuario")]
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> VincularUsuario(
        Guid id,
        VincularUsuarioMecanicoDto dto)
    {
        // Confere no banco (não só no token) que quem vincula continua sendo Admin
        var escopo = await _escopo.ObterMecanicoRestritoAsync(User.GetUsuarioId());

        if (escopo.HasValue)
            throw new AcessoNegadoException("Apenas administradores podem vincular usuários.");

        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        await _service.VincularUsuarioAsync(id, oficina.Id, dto.Email);

        return NoContent();
    }

    [HttpPost("{id}/criar-acesso")]
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> CriarAcesso(
        Guid id,
        CriarAcessoMecanicoDto dto)
    {
        // Confere no banco (não só no token) que quem cria o acesso continua sendo Admin
        var escopo = await _escopo.ObterMecanicoRestritoAsync(User.GetUsuarioId());

        if (escopo.HasValue)
            throw new AcessoNegadoException("Apenas administradores podem criar acessos.");

        if (string.IsNullOrWhiteSpace(dto.Senha) || dto.Senha.Length < 8)
            return BadRequest(new { mensagem = "A senha deve ter no mínimo 8 caracteres." });

        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var senhaHash = new PasswordHasher<Usuario>()
            .HashPassword(new Usuario(), dto.Senha);

        await _service.CriarAcessoAsync(id, oficina.Id, dto.Email, senhaHash);

        return NoContent();
    }
}