using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Domain.Enums;
using OficinaMecanica.Infrastructure.Repositories;
using System.Linq;

namespace OficinaMecanica.Application.Services;

public class OrdemServicoAppService
{
    private readonly OrdemServicoRepository _repository;
    private readonly ClienteRepository _clienteRepository;
    private readonly VeiculoRepository _veiculoRepository;
    private readonly HistoricoOrdemServicoRepository _historicoRepository;


    public OrdemServicoAppService(
        OrdemServicoRepository repository,
        ClienteRepository clienteRepository,
        VeiculoRepository veiculoRepository,
        HistoricoOrdemServicoRepository historicoRepository)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
        _veiculoRepository = veiculoRepository;
        _historicoRepository = historicoRepository;
    }


    public async Task<OrdemServicoResponseDto> CriarAsync(CriarOrdemServicoDto dto)
    {
        var cliente = await _clienteRepository.ObterPorIdAsync(dto.ClienteId);

        if (cliente == null)
            throw new Exception("Cliente não encontrado.");


        var veiculo = await _veiculoRepository.ObterPorIdAsync(dto.VeiculoId);

        if (veiculo == null)
            throw new Exception("Veículo não encontrado.");


        if (veiculo.ClienteId != dto.ClienteId)
            throw new Exception("O veículo não pertence ao cliente informado.");


        var ordemServico = new OrdemServico(
            cliente.OficinaId,
            dto.ClienteId,
            dto.VeiculoId,
            dto.Descricao,
            dto.ValorMaoObra
        );


        foreach (var itemDto in dto.Itens)
        {
            var item = new OrdemServicoItem(
                itemDto.Descricao,
                itemDto.Quantidade,
                itemDto.ValorUnitario
            );

            ordemServico.AdicionarItem(item);
        }


        var ordemCriada = await _repository.AdicionarAsync(ordemServico);

        return MapearResponse(ordemCriada);
    }



    public async Task<OrdemServicoResponseDto?> ObterPorIdAsync(Guid id)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            return null;


        return MapearResponse(ordem);
    }



    // Usado por PDF e serviços internos que precisam da entidade completa
    public async Task<OrdemServico?> ObterEntidadePorIdAsync(Guid id)
    {
        return await _repository.ObterPorIdAsync(id);
    }



    public async Task<List<OrdemServicoResponseDto>> ListarAsync()
    {
        var ordens = await _repository.ListarAsync();

        return ordens
            .Select(MapearResponse)
            .ToList();
    }
    public async Task EnviarParaAprovacaoAsync(Guid id)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception("Ordem de serviço não encontrada.");


        var statusAnterior = ordem.Status;

        ordem.EnviarParaAprovacao();

        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(ordem, statusAnterior);
    }



    public async Task AprovarAsync(Guid id)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception("Ordem de serviço não encontrada.");


        var statusAnterior = ordem.Status;

        ordem.Aprovar();

        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(ordem, statusAnterior);
    }



    public async Task RecusarAsync(Guid id)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception("Ordem de serviço não encontrada.");


        var statusAnterior = ordem.Status;

        ordem.Recusar();

        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(ordem, statusAnterior);
    }



    public async Task ConcluirAsync(Guid id)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception("Ordem de serviço não encontrada.");


        var statusAnterior = ordem.Status;

        ordem.Concluir();

        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(ordem, statusAnterior);
    }



    public async Task CancelarAsync(Guid id, string motivo)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception("Ordem de serviço não encontrada.");


        var statusAnterior = ordem.Status;

        ordem.Cancelar(motivo);

        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(
            ordem,
            statusAnterior,
            motivo
        );
    }



    public async Task ReabrirAsync(Guid id, string motivo)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception("Ordem de serviço não encontrada.");


        var statusAnterior = ordem.Status;

        ordem.Reabrir(motivo);

        await _repository.AtualizarAsync(ordem);

        await RegistrarHistoricoAsync(
            ordem,
            statusAnterior,
            motivo
        );
    }



    public async Task<List<HistoricoOrdemServicoResponseDto>> ObterHistoricoAsync(Guid ordemServicoId)
    {
        var historicos = await _historicoRepository
            .ObterPorOrdemServicoIdAsync(ordemServicoId);


        return historicos
            .Select(h => new HistoricoOrdemServicoResponseDto
            {
                Id = h.Id,

                OrdemServicoId = h.OrdemServicoId,

                StatusAnterior = h.StatusAnterior,

                NovoStatus = h.NovoStatus,

                Observacao = h.Observacao,

                DataAlteracao = h.DataAlteracao

            })
            .ToList();
    }



    private async Task RegistrarHistoricoAsync(
        OrdemServico ordem,
        StatusOrdemServico statusAnterior,
        string? observacao = null)
    {
        var historico = new HistoricoOrdemServico(
            ordem.Id,
            statusAnterior,
            ordem.Status,
            observacao
        );


        await _historicoRepository.AdicionarAsync(historico);
    }



    private static OrdemServicoResponseDto MapearResponse(OrdemServico ordem)
    {
        return new OrdemServicoResponseDto
        {
            Id = ordem.Id,

            ClienteId = ordem.ClienteId,

            VeiculoId = ordem.VeiculoId,

            Cliente = new ClienteResponseDto
            {
                Id = ordem.Cliente.Id,
                Nome = ordem.Cliente.Nome,
                Telefone = ordem.Cliente.Telefone
            },

            Veiculo = new VeiculoResponseDto
            {
                Id = ordem.Veiculo.Id,
                Marca = ordem.Veiculo.Marca,
                Modelo = ordem.Veiculo.Modelo,
                Placa = ordem.Veiculo.Placa
            },

            Descricao = ordem.Descricao,

            ValorMaoObra = ordem.ValorMaoObra,

            ValorTotal = ordem.ValorTotal,

            Status = ordem.Status,

            DataCriacao = ordem.DataCriacao,

            Itens = ordem.Itens
                .Select(i => new OrdemServicoItemDto
                {
                    Descricao = i.Descricao,
                    Quantidade = i.Quantidade,
                    ValorUnitario = i.ValorUnitario
                })
                .ToList(),

            Historicos = ordem.Historicos
                .Select(h => new HistoricoOrdemServicoResponseDto
                {
                    Id = h.Id,
                    OrdemServicoId = h.OrdemServicoId,
                    StatusAnterior = h.StatusAnterior,
                    NovoStatus = h.NovoStatus,
                    Observacao = h.Observacao,
                    DataAlteracao = h.DataAlteracao
                })
                .ToList()
        };
    }



    public async Task AdicionarItemAsync(Guid ordemId, OrdemServicoItemDto dto)
    {
        var ordem = await _repository.ObterPorIdAsync(ordemId);

        if (ordem == null)
            throw new Exception("Ordem não encontrada.");


        var item = new OrdemServicoItem(
            dto.Descricao,
            dto.Quantidade,
            dto.ValorUnitario
        );


        ordem.AdicionarItem(item);


        await _repository.AtualizarAsync(ordem);
    }

    public async Task AtualizarAsync(
      Guid id,
      AtualizarOrdemServicoDto dto)
    {
        var ordem = await _repository.ObterPorIdAsync(id);

        if (ordem == null)
            throw new Exception("Ordem de serviço não encontrada.");


        if (ordem.Status != StatusOrdemServico.Aberta)
            throw new Exception(
                "Somente ordens abertas podem ser editadas."
            );


        var cliente = await _clienteRepository.ObterPorIdAsync(dto.ClienteId);

        if (cliente == null)
            throw new Exception("Cliente não encontrado.");


        var veiculo = await _veiculoRepository.ObterPorIdAsync(dto.VeiculoId);

        if (veiculo == null)
            throw new Exception("Veículo não encontrado.");


        if (veiculo.ClienteId != dto.ClienteId)
            throw new Exception(
                "O veículo não pertence ao cliente informado."
            );


        ordem.AtualizarDados(
            dto.ClienteId,
            dto.VeiculoId,
            dto.Descricao,
            dto.ValorMaoObra
        );


        await _repository.AtualizarAsync(ordem);
    }
}