using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.DTOs.Pecas;
using OficinaMecanica.Application.Exceptions;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Repositories;

namespace OficinaMecanica.Application.Services;

public class PecasAppService
{
    private readonly PecasRepository _repository;
    private readonly OrdemServicoRepository _ordemServicoRepository;

    public PecasAppService(
        PecasRepository repository,
        OrdemServicoRepository ordemServicoRepository)
    {
        _repository = repository;
        _ordemServicoRepository = ordemServicoRepository;
    }

    public async Task<List<Pecas>> ListarAsync(Guid oficinaId)
    {
        return await _repository.GetAllAsync(oficinaId);
    }

    public async Task<Pecas?> ObterPorIdAsync(
        Guid id,
        Guid oficinaId)
    {
        return await _repository.GetByIdAsync(
            id,
            oficinaId);
    }

    public async Task<Pecas> CriarAsync(
        Guid oficinaId,
        string nome,
        string? codigo,
        decimal valorCusto,
        decimal valorVenda,
        int quantidadeEstoque,
        int estoqueMinimo)
    {
        var peca = new Pecas(
            oficinaId,
            nome,
            codigo,
            valorCusto,
            valorVenda,
            quantidadeEstoque,
            estoqueMinimo);

        await _repository.AddAsync(peca);
        await _repository.SaveChangesAsync();

        return peca;
    }

    public async Task<Pecas> AtualizarAsync(
        Guid id,
        Guid oficinaId,
        string nome,
        string? codigo,
        decimal valorCusto,
        decimal valorVenda,
        int estoqueMinimo)
    {
        var peca = await _repository.GetByIdAsync(
            id,
            oficinaId);

        if (peca == null)
        {
            throw new RegraNegocioException(
                "Peça não encontrada.");
        }

        peca.Atualizar(
            nome,
            codigo,
            valorCusto,
            valorVenda,
            estoqueMinimo);

        _repository.Update(peca);

        await _repository.SaveChangesAsync();

        return peca;
    }

    public async Task AtivarAsync(
        Guid id,
        Guid oficinaId)
    {
        var peca = await _repository.GetByIdAsync(
            id,
            oficinaId);

        if (peca == null)
        {
            throw new RegraNegocioException(
                "Peça não encontrada.");
        }

        peca.AlterarStatus(true);

        _repository.Update(peca);

        await _repository.SaveChangesAsync();
    }

    public async Task InativarAsync(
        Guid id,
        Guid oficinaId)
    {
        var peca = await _repository.GetByIdAsync(
            id,
            oficinaId);

        if (peca == null)
        {
            throw new RegraNegocioException(
                "Peça não encontrada.");
        }

        peca.AlterarStatus(false);

        _repository.Update(peca);

        await _repository.SaveChangesAsync();
    }

    public async Task<Pecas> AjustarEstoqueAsync(
        Guid id,
        Guid oficinaId,
        int quantidade)
    {
        var peca = await _repository.GetByIdAsync(
            id,
            oficinaId);

        if (peca == null)
        {
            throw new RegraNegocioException(
                "Peça não encontrada.");
        }

        if (quantidade < 0)
        {
            throw new RegraNegocioException(
                "A quantidade em estoque não pode ser negativa.");
        }

        var quantidadeReservada =
            await _ordemServicoRepository
                .ObterQuantidadeReservadaAsync(peca.Id);

        if (quantidade < quantidadeReservada)
        {
            var reservas =
                await _ordemServicoRepository
                    .ObterReservasPorOrdemAsync(peca.Id);

            var detalhesReservas = string.Join(
                ", ",
                reservas.Select(r =>
                    $"OS #{r.OrdemId.ToString()[..8].ToUpper()} ({r.Quantidade} unidade(s))"));

            throw new RegraNegocioException(
                $"Não é possível reduzir o estoque para {quantidade}. " +
                $"Estoque reservado: {quantidadeReservada}. " +
                $"Reservas: {detalhesReservas}.");
        }

        peca.AjustarEstoque(quantidade);

        _repository.Update(peca);

        await _repository.SaveChangesAsync();

        return peca;
    }

    public async Task ExcluirAsync(
        Guid id,
        Guid oficinaId)
    {
        var peca = await _repository.GetByIdAsync(
            id,
            oficinaId);

        if (peca == null)
        {
            throw new RegraNegocioException(
                "Peça não encontrada.");
        }

        var foiUtilizada =
            await _repository.FoiUtilizadaEmOrdemServicoAsync(
                peca.Id);

        if (foiUtilizada)
        {
            throw new RegraNegocioException(
                "Não é possível excluir esta peça porque ela já foi utilizada em uma Ordem de Serviço. " +
                "Inative a peça caso não queira mais utilizá-la.");
        }

        _repository.Remove(peca);

        await _repository.SaveChangesAsync();
    }

    public async Task<List<PecaDisponivelOrdemServicoDto>>
        ListarDisponiveisParaOrdemServicoAsync(
            Guid oficinaId,
            Guid? ordemId = null)
    {
        var pecas = await _repository.GetAllAsync(oficinaId);

        var resultado =
            new List<PecaDisponivelOrdemServicoDto>();

        var quantidadeReservadaNestaOrdem =
            new Dictionary<Guid, int>();

        if (ordemId.HasValue)
        {
            var ordem =
                await _ordemServicoRepository.ObterPorIdAsync(
                    ordemId.Value);

            if (ordem == null)
            {
                throw new RegraNegocioException(
                    "Ordem de serviço não encontrada.");
            }

            foreach (
                var item in ordem.Itens
                    .Where(i => i.PecaId.HasValue))
            {
                var pecaId = item.PecaId!.Value;

                if (
                    quantidadeReservadaNestaOrdem
                        .ContainsKey(pecaId))
                {
                    quantidadeReservadaNestaOrdem[pecaId] +=
                        item.Quantidade;
                }
                else
                {
                    quantidadeReservadaNestaOrdem[pecaId] =
                        item.Quantidade;
                }
            }
        }

        foreach (var peca in pecas)
        {
            if (!peca.Ativa)
            {
                continue;
            }

            var quantidadeReservadaOutrasOrdens =
                await _ordemServicoRepository
                    .ObterQuantidadeReservadaAsync(
                        peca.Id,
                        ordemId);

            quantidadeReservadaNestaOrdem.TryGetValue(
                peca.Id,
                out var quantidadeNestaOrdem);

            var quantidadeDisponivelParaOrdem =
                peca.QuantidadeEstoque -
                quantidadeReservadaOutrasOrdens;

            if (quantidadeDisponivelParaOrdem <= 0)
            {
                continue;
            }

            resultado.Add(
                new PecaDisponivelOrdemServicoDto
                {
                    Id = peca.Id,
                    Nome = peca.Nome,
                    Codigo = peca.Codigo,
                    ValorVenda = peca.ValorVenda,
                    QuantidadeEstoque =
                        peca.QuantidadeEstoque,
                    QuantidadeReservadaOutrasOrdens =
                        quantidadeReservadaOutrasOrdens,
                    QuantidadeReservadaNestaOrdem =
                        quantidadeNestaOrdem,
                    QuantidadeDisponivelParaOrdem =
                        quantidadeDisponivelParaOrdem
                });
        }

        return resultado;
    }
}