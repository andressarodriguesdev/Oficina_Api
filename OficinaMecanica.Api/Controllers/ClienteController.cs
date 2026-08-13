using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Services;

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
    public async Task<IActionResult> Criar(
        CriarClienteDto dto)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var cliente = await _service.CriarAsync(
            dto,
            oficina.Id
        );

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = cliente.Id },
            cliente
        );
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var clientes = await _service.ListarAsync(
            oficina.Id
        );

        return Ok(clientes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(
        Guid id)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var cliente = await _service.BuscarPorIdAsync(
            id,
            oficina.Id
        );

        if (cliente == null)
            return NotFound();

        return Ok(cliente);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(
        Guid id,
        AtualizarClienteDto dto)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var clienteAtualizado = await _service.AtualizarAsync(
            id,
            dto,
            oficina.Id
        );

        if (clienteAtualizado == null)
            return NotFound();

        return Ok(clienteAtualizado);
    }

    [HttpPatch("{id}/inativar")]
    public async Task<IActionResult> Inativar(
        Guid id)
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
    public async Task<IActionResult> Reativar(
        Guid id)
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
    public async Task<IActionResult> Remover(
        Guid id)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        await _service.RemoverAsync(
            id,
            oficina.Id
        );

        return NoContent();
    }

    [HttpGet("{id}/historico")]
    public async Task<IActionResult> Historico(
        Guid id)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var historico = await _service.BuscarHistoricoAsync(
            id,
            oficina.Id
        );

        return Ok(historico);
    }
}