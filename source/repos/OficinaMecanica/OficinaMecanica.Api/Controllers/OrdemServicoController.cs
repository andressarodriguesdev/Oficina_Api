using Microsoft.AspNetCore.Mvc;

using OficinaMecanica.Application.DTOs;

using OficinaMecanica.Application.Services;

namespace OficinaMecanica.Api.Controllers;

[ApiController]

[Route("api/[controller]")]

public class OrdemServicoController : ControllerBase

{

    private readonly OrdemServicoAppService _service;

    public OrdemServicoController(OrdemServicoAppService service)

    {

        _service = service;

    }

    [HttpPost]

    public async Task<IActionResult> Criar(CriarOrdemServicoDto dto)

    {

        var ordemServico = await _service.CriarAsync(dto);

        return CreatedAtAction(nameof(ObterPorId), new { id = ordemServico.Id }, ordemServico);

    }

    [HttpGet("{id}")]

    public async Task<IActionResult> ObterPorId(Guid id)

    {

        var ordemServico = await _service.ObterPorIdAsync(id);

        if (ordemServico == null)

            return NotFound();

        return Ok(ordemServico);

    }

    [HttpGet]

    public async Task<IActionResult> Listar()

    {

        var ordens = await _service.ListarAsync();

        return Ok(ordens);

    }

    [HttpPost("{id}/enviar-aprovacao")]

    public async Task<IActionResult> EnviarParaAprovacao(Guid id)

    {

        await _service.EnviarParaAprovacaoAsync(id);

        return NoContent();

    }

    [HttpPost("{id}/aprovar")]

    public async Task<IActionResult> Aprovar(Guid id)

    {

        await _service.AprovarAsync(id);

        return NoContent();

    }

    [HttpPost("{id}/recusar")]

    public async Task<IActionResult> Recusar(Guid id)

    {

        await _service.RecusarAsync(id);

        return NoContent();

    }

    [HttpPost("{id}/concluir")]

    public async Task<IActionResult> Concluir(Guid id)

    {

        await _service.ConcluirAsync(id);

        return NoContent();

    }

    [HttpPost("{id}/cancelar")]

    public async Task<IActionResult> Cancelar(Guid id, CancelarOrdemServicoDto dto)

    {

        await _service.CancelarAsync(id, dto.Motivo);

        return NoContent();

    }

    [HttpPost("{id}/reabrir")]
    public async Task<IActionResult> Reabrir(Guid id, ReabrirOrdemServicoDto dto)
    {
        await _service.ReabrirAsync(id, dto.Motivo);

        return NoContent();
    }

}