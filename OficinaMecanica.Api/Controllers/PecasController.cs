using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Api.Security;
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
    private readonly EscopoMecanicoService _escopo;

    public PecasController(
        PecasAppService service,
        OficinaAppService oficinaAppService,
        EscopoMecanicoService escopo)
    {
        _service = service;
        _escopo = escopo;
        _oficinaService = oficinaAppService;
    }

    // Mecânico consulta peças e estoque, mas não vê o valor de custo (dado financeiro)
    private static Dictionary<string, object?> SemCusto(Pecas peca) =>
        typeof(Pecas).GetProperties()
            .Where(pr => pr.Name != nameof(Pecas.ValorCusto)
                && pr.GetIndexParameters().Length == 0
                && (pr.PropertyType.IsValueType
                    || pr.PropertyType == typeof(string)))
            .ToDictionary(
                pr => char.ToLowerInvariant(pr.Name[0]) + pr.Name[1..],
                pr => pr.GetValue(peca));

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

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

        var restrito = await _escopo.ObterMecanicoRestritoAsync(User.GetUsuarioId());

        if (restrito.HasValue)
            return Ok(pecas.Select(SemCusto).ToList());

        return Ok(pecas);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

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

        var restrito = await _escopo.ObterMecanicoRestritoAsync(User.GetUsuarioId());

        if (restrito.HasValue)
            return Ok(SemCusto(peca));

        return Ok(peca);
    }

    [HttpPost]
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> Criar(
        [FromBody] CriarPecaDto dto)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

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
                dto.EstoqueMinimo,
                User.GetUsuarioId());

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
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> Atualizar(
        Guid id,
        [FromBody] AtualizarPecaDto dto)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

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
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> Ativar(Guid id)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

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
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> Inativar(Guid id)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

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
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> AjustarEstoque(
        Guid id,
        [FromBody] int quantidade)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

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
                quantidade,
                User.GetUsuarioId());

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
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

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

    [HttpGet("relatorio-estoque")]
    public async Task<IActionResult> RelatorioEstoque(
        [FromQuery] bool incluirInativas = false)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
        {
            return BadRequest(
                new
                {
                    message =
                        "Nenhuma oficina cadastrada no sistema."
                });
        }

        var relatorio =
            await _service.ObterRelatorioEstoqueAsync(
                oficina.Id,
                incluirInativas);

        // Mecânico vê o relatório com o valor de venda unitário, sem custo nem totais em R$
        var restrito = await _escopo.ObterMecanicoRestritoAsync(User.GetUsuarioId());

        if (restrito.HasValue)
        {
            relatorio.Resumo.ValorTotalCusto = 0;
            relatorio.Resumo.ValorTotalVenda = 0;

            foreach (var item in relatorio.Itens)
            {
                item.ValorCusto = 0;
                item.ValorTotalCusto = 0;
                item.ValorTotalVenda = 0;
            }
        }

        return Ok(relatorio);
    }

    [HttpGet("disponiveis-ordem-servico")]
    public async Task<IActionResult>
        ListarDisponiveisParaOrdemServico(
            [FromQuery] Guid? ordemId = null)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

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
    [Authorize(Roles = PerfilUsuario.Admin)]
    public async Task<IActionResult> Excluir(Guid id)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

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