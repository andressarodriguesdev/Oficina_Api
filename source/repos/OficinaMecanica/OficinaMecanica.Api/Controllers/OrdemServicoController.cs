using Microsoft.AspNetCore.Mvc;

using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Infrastructure.Services;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdemServicoController : ControllerBase
{
    private readonly OrdemServicoAppService _service;
    private readonly OrdemServicoPdfService _pdfService;


    public OrdemServicoController(
        OrdemServicoAppService service,
        OrdemServicoPdfService pdfService)
    {
        _service = service;
        _pdfService = pdfService;
    }


    [HttpPost]
    public async Task<IActionResult> Criar(CriarOrdemServicoDto dto)
    {
        var ordemServico = await _service.CriarAsync(dto);

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = ordemServico.Id },
            ordemServico);
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
    public async Task<IActionResult> Cancelar(
        Guid id,
        CancelarOrdemServicoDto dto)
    {
        await _service.CancelarAsync(id, dto.Motivo);

        return NoContent();
    }


    [HttpPost("{id}/reabrir")]
    public async Task<IActionResult> Reabrir(
        Guid id,
        ReabrirOrdemServicoDto dto)
    {
        await _service.ReabrirAsync(id, dto.Motivo);

        return NoContent();
    }


    [HttpGet("{id}/historico")]
    public async Task<IActionResult> Historico(Guid id)
    {
        var historico = await _service.ObterHistoricoAsync(id);

        return Ok(historico);
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GerarPdf(Guid id)
    {
        var ordemServico = await _service.ObterEntidadePorIdAsync(id);

        if (ordemServico == null)
            return NotFound();


        var pdf = _pdfService.GerarPdf(ordemServico);


        return File(
            pdf,
            "application/pdf",
            $"ordem-servico-{id}.pdf");
    }
}