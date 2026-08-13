using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.DTOs.Mecanico;
using OficinaMecanica.Application.Services;

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
    public async Task<IActionResult> GetAll()
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var mecanicos = await _service.GetAllAsync(
            oficina.Id
        );

        return Ok(mecanicos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

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

        return Ok(mecanico);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        MecanicoRequestDto dto)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

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
    public async Task<IActionResult> Update(
        Guid id,
        MecanicoRequestDto dto)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

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
    public async Task<IActionResult> Inativar(Guid id)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

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
    public async Task<IActionResult> Reativar(Guid id)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

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
    public async Task<IActionResult> Delete(Guid id)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

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
}