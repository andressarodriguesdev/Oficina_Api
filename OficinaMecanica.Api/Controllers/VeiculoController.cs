using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Services;
using System.Security.Claims;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VeiculoController : ControllerBase
{
    private readonly VeiculoAppService _service;
    private readonly OficinaAppService _oficinaService;

    public VeiculoController(
        VeiculoAppService service,
        OficinaAppService oficinaService)
    {
        _service = service;
        _oficinaService = oficinaService;
    }

    [HttpPost]
    public async Task<IActionResult> Criar(CriarVeiculoDto dto)
    {
        var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(usuarioIdClaim, out var usuarioId))
            return Unauthorized();

        var oficina = await _oficinaService.ObterPorUsuarioIdAsync(usuarioId);

        if (oficina == null)
            return BadRequest("O usuário não possui uma oficina cadastrada.");

        var veiculo = await _service.CriarAsync(dto, oficina.Id);

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = veiculo.Id },
            veiculo
        );
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var veiculos = await _service.ListarAsync();

        return Ok(veiculos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var veiculo = await _service.BuscarPorIdAsync(id);

        if (veiculo == null)
            return NotFound();

        return Ok(veiculo);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(
        Guid id,
        AtualizarVeiculoDto dto)
    {
        var veiculoAtualizado = await _service.AtualizarAsync(id, dto);

        if (veiculoAtualizado == null)
            return NotFound();

        return Ok(veiculoAtualizado);
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
    public async Task<IActionResult> Remover(Guid id)
    {
        await _service.RemoverAsync(id);

        return NoContent();
    }
}