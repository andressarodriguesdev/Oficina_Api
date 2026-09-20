using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.DTOs.Pecas;
using OficinaMecanica.Application.Exceptions;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Domain.Entities;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/pecas")]
[Authorize]
public class PecasController : ControllerBase
{
    private readonly PecasAppService _service;
    private readonly OficinaAppService _oficinaService;

    public PecasController(
        PecasAppService service,
        OficinaAppService oficinaAppService)
    {
        _service = service;
        _oficinaService = oficinaAppService;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
        {
            return BadRequest(
                new
                {
                    message =
                        "Nenhuma oficina cadastrada no sistema."
                });
        }

        var pecas = await _service.ListarAsync(oficina.Id);

        return Ok(pecas);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
        {
            return BadRequest(
                new
                {
                    message =
                        "Nenhuma oficina cadastrada no sistema."
                });
        }

        var peca = await _service.ObterPorIdAsync(
            id,
            oficina.Id);

        if (peca == null)
        {
            return NotFound(
                new
                {
                    message = "Peça não encontrada."
                });
        }

        return Ok(peca);
    }

    [HttpPost]
    public async Task<IActionResult> Criar(
        [FromBody] CriarPecaDto dto)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
        {
            return BadRequest(
                new
                {
                    message =
                        "Nenhuma oficina cadastrada no sistema."
                });
        }

        try
        {
            var peca = await _service.CriarAsync(
                oficina.Id,
                dto.Nome,
                dto.Codigo,
                dto.ValorCusto,
                dto.ValorVenda,
                dto.QuantidadeEstoque,
                dto.EstoqueMinimo);

            return CreatedAtAction(
                nameof(ObterPorId),
                new { id = peca.Id },
                peca);
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(
                new
                {
                    message = ex.Message
                });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Atualizar(
        Guid id,
        [FromBody] AtualizarPecaDto dto)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
        {
            return BadRequest(
                new
                {
                    message =
                        "Nenhuma oficina cadastrada no sistema."
                });
        }

        try
        {
            var peca = await _service.AtualizarAsync(
                id,
                oficina.Id,
                dto.Nome,
                dto.Codigo,
                dto.ValorCusto,
                dto.ValorVenda,
                dto.EstoqueMinimo);

            return Ok(peca);
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(
                new
                {
                    message = ex.Message
                });
        }
    }

    [HttpPatch("{id:guid}/ativar")]
    public async Task<IActionResult> Ativar(Guid id)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
        {
            return BadRequest(
                new
                {
                    message =
                        "Nenhuma oficina cadastrada no sistema."
                });
        }

        try
        {
            await _service.AtivarAsync(
                id,
                oficina.Id);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(
                new
                {
                    message = ex.Message
                });
        }
    }

    [HttpPatch("{id:guid}/inativar")]
    public async Task<IActionResult> Inativar(Guid id)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
        {
            return BadRequest(
                new
                {
                    message =
                        "Nenhuma oficina cadastrada no sistema."
                });
        }

        try
        {
            await _service.InativarAsync(
                id,
                oficina.Id);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(
                new
                {
                    message = ex.Message
                });
        }
    }

    [HttpPatch("{id:guid}/estoque/ajustar")]
    public async Task<IActionResult> AjustarEstoque(
        Guid id,
        [FromBody] int quantidade)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
        {
            return BadRequest(
                new
                {
                    message =
                        "Nenhuma oficina cadastrada no sistema."
                });
        }

        try
        {
            var peca = await _service.AjustarEstoqueAsync(
                id,
                oficina.Id,
                quantidade);

            return Ok(peca);
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(
                new
                {
                    message = ex.Message
                });
        }
    }

    [HttpGet("{id:guid}/estoque/historico")]
    public async Task<IActionResult> HistoricoEstoque(
        Guid id,
        [FromQuery] DateTime? de,
        [FromQuery] DateTime? ate,
        [FromQuery] TipoMovimentacaoEstoque? tipo)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
        {
            return BadRequest(
                new
                {
                    message =
                        "Nenhuma oficina cadastrada no sistema."
                });
        }

        try
        {
            var historico =
                await _service.ListarHistoricoEstoqueAsync(
                    id,
                    oficina.Id,
                    de,
                    ate,
                    tipo);

            return Ok(historico);
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(
                new
                {
                    message = ex.Message
                });
        }
    }

    [HttpGet("disponiveis-ordem-servico")]
    public async Task<IActionResult>
        ListarDisponiveisParaOrdemServico(
            [FromQuery] Guid? ordemId = null)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
        {
            return BadRequest(
                new
                {
                    message =
                        "Nenhuma oficina cadastrada no sistema."
                });
        }

        try
        {
            var pecas =
                await _service
                    .ListarDisponiveisParaOrdemServicoAsync(
                        oficina.Id,
                        ordemId);

            return Ok(pecas);
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(
                new
                {
                    message = ex.Message
                });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Excluir(Guid id)
    {
        var oficina = await _oficinaService.ObterUnicaAsync();

        if (oficina == null)
        {
            return BadRequest(
                new
                {
                    message =
                        "Nenhuma oficina cadastrada no sistema."
                });
        }

        try
        {
            await _service.ExcluirAsync(
                id,
                oficina.Id);

            return NoContent();
        }
        catch (RegraNegocioException ex)
        {
            return Conflict(
                new
                {
                    message = ex.Message
                });
        }
    }
}