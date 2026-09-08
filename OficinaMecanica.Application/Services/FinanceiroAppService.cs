using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.DTOs.Financeiro;
using OficinaMecanica.Domain.Enums;
using OficinaMecanica.Infrastructure.Repositories;

namespace OficinaMecanica.Application.Services;

public class FinanceiroAppService
{
    private readonly OrdemServicoRepository _repository;

    public FinanceiroAppService(
        OrdemServicoRepository repository)
    {
        _repository = repository;
    }

    public async Task<FinanceiroResponseDto> ObterAsync()
    {
        var ordens = await _repository.ListarFinanceiroAsync();

        // ---------------------------------------------------------
        // FATURAMENTO
        // ---------------------------------------------------------
        // Consideramos faturado somente aquilo que foi concluído.
        var ordensConcluidas = ordens
            .Where(o => o.Status == StatusOrdemServico.Concluida)
            .ToList();

        // ---------------------------------------------------------
        // PENDÊNCIAS OPERACIONAIS
        // ---------------------------------------------------------
        // OS que ainda precisam de uma ação para avançar no fluxo.
        var ordensPendentes = ordens
            .Where(o =>
                o.Status == StatusOrdemServico.Aberta ||
                o.Status == StatusOrdemServico.AguardandoAprovacao)
            .ToList();

        // ---------------------------------------------------------
        // CANCELADAS
        // ---------------------------------------------------------
        var ordensCanceladas = ordens
            .Where(o => o.Status == StatusOrdemServico.Cancelada)
            .ToList();

        // ---------------------------------------------------------
        // PREVISTO
        // ---------------------------------------------------------
        // Receita que a oficina possui expectativa de receber.
        //
        // Aberta:
        // ainda está em processo.
        //
        // AguardandoAprovacao:
        // orçamento enviado, aguardando decisão do cliente.
        //
        // Aprovada:
        // cliente aprovou o serviço.
        //
        // Reaberta:
        // OS voltou para o fluxo e ainda pode gerar faturamento.
        var ordensPrevistas = ordens
            .Where(o =>
                o.Status == StatusOrdemServico.Aberta ||
                o.Status == StatusOrdemServico.AguardandoAprovacao ||
                o.Status == StatusOrdemServico.Aprovada ||
                o.Status == StatusOrdemServico.Reaberta)
            .ToList();

        var resultado = new FinanceiroResponseDto();

        // ---------------------------------------------------------
        // QUANTIDADE TOTAL DE ORDENS
        // ---------------------------------------------------------
        resultado.QuantidadeOrdens = ordens.Count;

        // ---------------------------------------------------------
        // TOTAL FATURADO
        // ---------------------------------------------------------
        resultado.TotalFaturado = ordensConcluidas
            .Sum(o => o.ValorTotal);

        // ---------------------------------------------------------
        // TOTAL DE MÃO DE OBRA FATURADA
        // ---------------------------------------------------------
        resultado.TotalMaoObra = ordensConcluidas
            .Sum(o => o.ValorMaoObra);

        // ---------------------------------------------------------
        // TOTAL DE PEÇAS FATURADAS
        // ---------------------------------------------------------
        resultado.TotalPecas = ordensConcluidas
            .SelectMany(o => o.Itens)
            .Sum(i => i.Quantidade * i.ValorUnitario);

        // ---------------------------------------------------------
        // QUANTIDADE DE ORDENS CONCLUÍDAS
        // ---------------------------------------------------------
        resultado.QuantidadeConcluidas = ordensConcluidas.Count;

        // ---------------------------------------------------------
        // QUANTIDADE DE ORDENS PENDENTES
        // ---------------------------------------------------------
        resultado.QuantidadePendentes = ordensPendentes.Count;

        // ---------------------------------------------------------
        // QUANTIDADE DE ORDENS CANCELADAS
        // ---------------------------------------------------------
        resultado.QuantidadeCanceladas = ordensCanceladas.Count;

        // ---------------------------------------------------------
        // TOTAL PREVISTO
        // ---------------------------------------------------------
        resultado.TotalPrevisto = ordensPrevistas
            .Sum(o => o.ValorTotal);

        // ---------------------------------------------------------
        // DETALHAMENTO FINANCEIRO DAS ORDENS
        // ---------------------------------------------------------
        resultado.Ordens = ordens
            .Select(o => new FinanceiroOrdemDto
            {
                Id = o.Id,

                Cliente = o.Cliente.Nome,

                Veiculo = $"{o.Veiculo.Marca} {o.Veiculo.Modelo}",

                Mecanico = o.Mecanico?.Nome ?? "Não informado",

                MaoObra = o.ValorMaoObra,

                Pecas = o.Itens
                    .Sum(i => i.Quantidade * i.ValorUnitario),

                Total = o.ValorTotal,

                Status = o.Status,

                Data = o.DataCriacao

            })
            .ToList();

        // ---------------------------------------------------------
        // PRODUTIVIDADE FINANCEIRA DOS MECÂNICOS
        // ---------------------------------------------------------
        //
        // Aqui permanecemos com essa informação dentro do Financeiro,
        // pois o valor de mão de obra representa receita gerada por
        // cada mecânico.
        resultado.ProdutividadeMecanicos = ordens
            .Where(o => o.Mecanico != null)
            .GroupBy(o => o.Mecanico)
            .Select(g => new ProdutividadeMecanicoDto
            {
                MecanicoId = g.Key.Id,

                Nome = g.Key.Nome,

                QuantidadeOrdens = g.Count(),

                QuantidadeConcluidas = g.Count(o =>
                    o.Status == StatusOrdemServico.Concluida),

                TotalMaoObra = g
                    .Where(o => o.Status == StatusOrdemServico.Concluida)
                    .Sum(o => o.ValorMaoObra)

            })
            .ToList();

        return resultado;
    }
}