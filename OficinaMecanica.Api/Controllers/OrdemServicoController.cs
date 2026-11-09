using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using OficinaMecanica.Api.Security;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Exceptions;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Infrastructure.Services;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Authorize]
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
        try
        {
            var ordem = await _service.CriarAsync(User.GetUsuarioId(), dto);

            return CreatedAtAction(
                nameof(ObterPorId),
                new { id = ordem.Id },
                ordem
            );
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var ordem = await _service.ObterPorIdAsync(User.GetUsuarioId(), id);

        if (ordem == null)
            return NotFound();

        return Ok(ordem);
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var ordens = await _service.ListarAsync(User.GetUsuarioId());

        return Ok(ordens);
    }

    [HttpPost("{id}/enviar-aprovacao")]
    public async Task<IActionResult> EnviarParaAprovacao(Guid id)
    {
        try
        {
            await _service.EnviarParaAprovacaoAsync(User.GetUsuarioId(), id);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPost("{id}/aprovar")]
    public async Task<IActionResult> Aprovar(Guid id)
    {
        try
        {
            await _service.AprovarAsync(User.GetUsuarioId(), id);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPost("{id}/recusar")]
    public async Task<IActionResult> Recusar(Guid id)
    {
        try
        {
            await _service.RecusarAsync(User.GetUsuarioId(), id);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPost("{id}/concluir")]
    public async Task<IActionResult> Concluir(Guid id)
    {
        try
        {
            await _service.ConcluirAsync(User.GetUsuarioId(), id);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPost("{id}/cancelar")]
    public async Task<IActionResult> Cancelar(
        Guid id,
        CancelarOrdemServicoDto dto)
    {
        try
        {
            await _service.CancelarAsync(User.GetUsuarioId(), id, dto.Motivo);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPost("{id}/reabrir")]
    public async Task<IActionResult> Reabrir(
        Guid id,
        ReabrirOrdemServicoDto dto)
    {
        try
        {
            await _service.ReabrirAsync(User.GetUsuarioId(), id, dto.Motivo);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("{id}/historico")]
    public async Task<IActionResult> Historico(Guid id)
    {
        var historico = await _service.ObterHistoricoAsync(User.GetUsuarioId(), id);

        return Ok(historico);
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GerarPdf(Guid id)
    {
        var ordem = await _service.ObterEntidadePorIdAsync(User.GetUsuarioId(), id);

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
        try
        {
            await _service.AdicionarItemAsync(User.GetUsuarioId(), id, dto);

            return Ok(new
            {
                mensagem = "Item adicionado com sucesso"
            });
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("{id}/whatsapp")]
    public async Task<IActionResult> GerarLinkWhatsApp(Guid id)
    {
        var ordem = await _service.ObterEntidadePorIdAsync(
            User.GetUsuarioId(), id, exigirResponsavel: true);

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
        try
        {
            await _service.AtualizarAsync(User.GetUsuarioId(), id, dto);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPut("{id}/itens/{itemId}")]
    public async Task<IActionResult> AtualizarItem(
        Guid id,
        Guid itemId,
        OrdemServicoItemDto dto)
    {
        try
        {
            await _service.AtualizarItemAsync(User.GetUsuarioId(), id, itemId, dto);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    [HttpDelete("{id}/itens/{itemId}")]
    public async Task<IActionResult> RemoverItem(
        Guid id,
        Guid itemId)
    {
        try
        {
            await _service.RemoverItemAsync(User.GetUsuarioId(), id, itemId);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }
}