using Microsoft.AspNetCore.Mvc;

using OficinaMecanica.Application.DTOs;

using OficinaMecanica.Application.Services;

namespace OficinaMecanica.Api.Controllers;

[ApiController]

[Route("api/[controller]")]

public class ClienteController : ControllerBase

{

    private readonly ClienteAppService _service;

    public ClienteController(ClienteAppService service)

    {

        _service = service;

    }

    [HttpPost]

    public async Task<IActionResult> Criar(CriarClienteDto dto)

    {

        var cliente = await _service.CriarAsync(dto);

        return CreatedAtAction(nameof(ObterPorId), new { id = cliente.Id }, cliente);

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

    public async Task<IActionResult> Atualizar(Guid id, AtualizarClienteDto dto)

    {

        var clienteAtualizado = await _service.AtualizarAsync(id, dto);

        if (clienteAtualizado == null)

            return NotFound();

        return Ok(clienteAtualizado);

    }

    [HttpDelete("{id}")]

    public async Task<IActionResult> Remover(Guid id)

    {

        await _service.RemoverAsync(id);

        return NoContent();

    }

}