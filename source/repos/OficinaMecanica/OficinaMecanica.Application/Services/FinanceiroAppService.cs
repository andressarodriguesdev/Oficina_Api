using OficinaMecanica.Application.DTOs;
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


        var ordensConcluidas = ordens
            .Where(o => o.Status == StatusOrdemServico.Concluida)
            .ToList();


        var ordensPendentes = ordens
            .Where(o =>
                o.Status == StatusOrdemServico.Aberta ||
                o.Status == StatusOrdemServico.AguardandoAprovacao)
            .ToList();


        var ordensCanceladas = ordens
            .Where(o => o.Status == StatusOrdemServico.Cancelada)
            .ToList();


        var resultado = new FinanceiroResponseDto();


        resultado.QuantidadeOrdens = ordens.Count;


        resultado.TotalFaturado = ordensConcluidas
            .Sum(o => o.ValorTotal);


        resultado.TotalMaoObra = ordensConcluidas
            .Sum(o => o.ValorMaoObra);


        resultado.TotalPecas = ordensConcluidas
            .SelectMany(o => o.Itens)
            .Sum(i => i.Quantidade * i.ValorUnitario);


        resultado.QuantidadeConcluidas = ordensConcluidas.Count;

        resultado.QuantidadePendentes = ordensPendentes.Count;

        resultado.QuantidadeCanceladas = ordensCanceladas.Count;


        resultado.TotalPrevisto = ordensPendentes
            .Sum(o => o.ValorTotal);


        resultado.Ordens = ordens.Select(o => new FinanceiroOrdemDto
        {
            Id = o.Id,

            Cliente = o.Cliente.Nome,

            Veiculo = $"{o.Veiculo.Marca} {o.Veiculo.Modelo}",

            MaoObra = o.ValorMaoObra,

            Pecas = o.Itens.Sum(i => i.Quantidade * i.ValorUnitario),

            Total = o.ValorTotal,

            Status = (int)o.Status,

            Data = o.DataCriacao

        }).ToList();


        return resultado;
    }
}