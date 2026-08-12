
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Services;
using System.Security.Claims;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/clientes")]
[Authorize]
public class ClienteController : ControllerBase
{
    private readonly ClienteAppService _service;
    private readonly OficinaAppService _oficinaService;

    public ClienteController(
        ClienteAppService service,
        OficinaAppService oficinaService)
    {
        _service = service;
        _oficinaService = oficinaService;
    }

    [HttpPost]
    public async Task<IActionResult> Criar(CriarClienteDto dto)
    {
        var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(usuarioIdClaim, out var usuarioId))
            return Unauthorized();

        var oficina = await _oficinaService.ObterPorUsuarioIdAsync(usuarioId);

        if (oficina == null)
            return BadRequest("O usuário não possui uma oficina cadastrada.");

        var cliente = await _service.CriarAsync(dto, oficina.Id);

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = cliente.Id },
            cliente
        );
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var clientes = await _service.ListarAsync();

        return Ok(clientes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var cliente = await _service.BuscarPorIdAsync(id);

        if (cliente == null)
            return NotFound();

        return Ok(cliente);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(
        Guid id,
        AtualizarClienteDto dto)
    {
        var clienteAtualizado = await _service.AtualizarAsync(id, dto);

        if (clienteAtualizado == null)
            return NotFound();

        return Ok(clienteAtualizado);
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

    [HttpGet("{id}/historico")]
    public async Task<IActionResult> Historico(Guid id)
    {
        var historico = await _service.BuscarHistoricoAsync(id);

        return Ok(historico);
    }
}

