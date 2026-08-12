
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Domain.Entities;
using System.Security.Claims;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MecanicoController : ControllerBase
{
    private readonly MecanicoAppService _service;
    private readonly OficinaAppService _oficinaService;

    public MecanicoController(
        MecanicoAppService service,
        OficinaAppService oficinaService)
    {
        _service = service;
        _oficinaService = oficinaService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Mecanico>>> GetAll()
    {
        var mecanicos = await _service.GetAllAsync();

        return Ok(mecanicos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Mecanico>> GetById(Guid id)
    {
        var mecanico = await _service.GetByIdAsync(id);

        if (mecanico == null)
            return NotFound();

        return Ok(mecanico);
    }

    [HttpPost]
    public async Task<ActionResult<MecanicoResponseDto>> Create(
        MecanicoRequestDto dto)
    {
        var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(usuarioIdClaim, out var usuarioId))
            return Unauthorized();

        var oficina = await _oficinaService.ObterPorUsuarioIdAsync(usuarioId);

        if (oficina == null)
            return BadRequest("O usuário não possui uma oficina cadastrada.");

        var criado = await _service.CreateAsync(dto, oficina.Id);

        return CreatedAtAction(
            nameof(GetById),
            new { id = criado.Id },
            criado
        );
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        Guid id,
        MecanicoRequestDto dto)
    {
        var atualizado = await _service.UpdateAsync(id, dto);

        if (!atualizado)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("{id}/inativar")]
    public async Task<IActionResult> Inativar(Guid id)
    {
        await _service.InativarAsync(id);

        return NoContent();
    }

    [HttpPatch("{id}/reativar")]
    public async Task<IActionResult> Reativar(Guid id)
    {
        await _service.ReativarAsync(id);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var removido = await _service.DeleteAsync(id);

        if (!removido)
            return NotFound();

        return NoContent();
    }
}

