using Microsoft.AspNetCore.Mvc;

using OficinaMecanica.Application.DTOs;

using OficinaMecanica.Application.Services;

namespace OficinaMecanica.Api.Controllers;

[ApiController]

[Route("api/[controller]")]

public class VeiculoController : ControllerBase

{

    private readonly VeiculoAppService _service;

    public VeiculoController(VeiculoAppService service)

    {

        _service = service;

    }

    [HttpPost]

    public async Task<IActionResult> Criar(CriarVeiculoDto dto)

    {

        var veiculo = await _service.CriarAsync(dto);

        return CreatedAtAction(nameof(ObterPorId), new { id = veiculo.Id }, veiculo);

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

    public async Task<IActionResult> Atualizar(Guid id, AtualizarVeiculoDto dto)

    {

        var veiculoAtualizado = await _service.AtualizarAsync(id, dto);

        if (veiculoAtualizado == null)

            return NotFound();

        return Ok(veiculoAtualizado);

    }

    [HttpDelete("{id}")]

    public async Task<IActionResult> Remover(Guid id)

    {

        await _service.RemoverAsync(id);

        return NoContent();

    }

}