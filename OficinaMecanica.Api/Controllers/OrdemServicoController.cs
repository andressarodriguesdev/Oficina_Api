using Microsoft.AspNetCore.Mvc;

using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Infrastructure.Services;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/ordens-servico")]
public class OrdemServicoController : ControllerBase
{
    private readonly OrdemServicoAppService _service;
    private readonly OrdemServicoPdfService _pdfService;
    private readonly WhatsAppService _whatsAppService;


    public OrdemServicoController(
        OrdemServicoAppService service,
        OrdemServicoPdfService pdfService,
        WhatsAppService whatsAppService)
    {
        _service = service;
        _pdfService = pdfService;
        _whatsAppService = whatsAppService;
    }


    [HttpPost]
    public async Task<IActionResult> Criar(CriarOrdemServicoDto dto)
    {
        var ordem = await _service.CriarAsync(dto);

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = ordem.Id },
            ordem
        );
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var ordem = await _service.ObterPorIdAsync(id);

        if (ordem == null)
            return NotFound();

        return Ok(ordem);
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
        var ordem = await _service.ObterEntidadePorIdAsync(id);

        if (ordem == null)
            return NotFound();


        var pdf = _pdfService.GerarPdf(ordem);


        return File(
            pdf,
            "application/pdf",
            $"ordem-servico-{id}.pdf"
        );
    }


    [HttpPost("{id}/itens")]
    public async Task<IActionResult> AdicionarItem(
        Guid id,
        OrdemServicoItemDto dto)
    {
        await _service.AdicionarItemAsync(id, dto);

        return Ok(new
        {
            mensagem = "Item adicionado com sucesso"
        });
    }


    [HttpGet("{id}/whatsapp")]
    public async Task<IActionResult> GerarLinkWhatsApp(Guid id)
    {
        var ordem = await _service.ObterEntidadePorIdAsync(id);

        if (ordem == null)
            return NotFound();


        var link = _whatsAppService.GerarLinkAprovacao(ordem);


        return Ok(new
        {
            link
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(
    Guid id,
    AtualizarOrdemServicoDto dto)
    {
        await _service.AtualizarAsync(id, dto);

        return NoContent();
    }
}