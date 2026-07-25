using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Domain.Entities;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MecanicoController : ControllerBase
{
    private readonly MecanicoAppService _service;

    public MecanicoController(MecanicoAppService service)
    {
        _service = service;
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
    public async Task<ActionResult<MecanicoResponseDto>> Create(MecanicoRequestDto dto)
    {
        var criado = await _service.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = criado.Id },
            criado
        );
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, Mecanico mecanico)
    {
        var atualizado = await _service.UpdateAsync(id, mecanico);

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