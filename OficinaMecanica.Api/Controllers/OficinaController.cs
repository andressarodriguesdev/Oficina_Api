using OficinaMecanica.Api.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.DTOs.Oficina;
using OficinaMecanica.Application.Services;
using System.Security.Claims;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/oficinas")]
public class OficinaController : ControllerBase
{
    private readonly OficinaAppService _service;

    public OficinaController(OficinaAppService service)
    {
        _service = service;
    }

    [Authorize(Roles = OficinaMecanica.Domain.Entities.PerfilUsuario.Admin)]
    [HttpPost]
    public async Task<IActionResult> Criar(CriarOficinaDto dto)
    {
        var usuarioIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized();
        }

        // O sistema permite apenas uma oficina cadastrada.
        var oficinaExistente = await _service.ObterUnicaAsync();

        if (oficinaExistente != null)
        {
            return BadRequest(
                "Já existe uma oficina cadastrada no sistema.");
        }

        var oficina = await _service.CriarAsync(dto, usuarioId);

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = oficina.Id },
            oficina);
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var propria = await _service.ObterParaUsuarioAsync(User.GetUsuarioId());

        // Só a oficina do próprio usuário; qualquer outro id é tratado como inexistente
        var oficina = propria != null && propria.Id == id ? propria : null;

        if (oficina == null)
        {
            return NotFound();
        }

        return Ok(oficina);
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var propria = await _service.ObterParaUsuarioAsync(User.GetUsuarioId());

        var oficinas = propria == null
            ? new List<OficinaResponseDto>()
            : new List<OficinaResponseDto> { propria };

        return Ok(oficinas);
    }

    [Authorize]
    [HttpGet("minha-oficina")]
    public async Task<IActionResult> MinhaOficina()
    {
        var oficina = await _service.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
        {
            return NotFound();
        }

        return Ok(oficina);
    }

    [Authorize(Roles = OficinaMecanica.Domain.Entities.PerfilUsuario.Admin)]
    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(
        Guid id,
        AtualizarOficinaDto dto)
    {
        var propria = await _service.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (propria == null || propria.Id != id)
        {
            return NotFound();
        }

        var oficina = await _service.AtualizarAsync(id, dto);

        if (oficina == null)
        {
            return NotFound();
        }

        return Ok(oficina);
    }
}