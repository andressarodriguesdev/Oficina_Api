using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Repositories;

namespace OficinaMecanica.Application.Services;

public class ClienteAppService
{
    private readonly ClienteRepository _repository;

    public ClienteAppService(ClienteRepository repository)
    {
        _repository = repository;
    }

    public async Task<ClienteResponseDto> CriarAsync(
        CriarClienteDto dto,
        Guid oficinaId)
    {
        var cliente = new Cliente(
            dto.Nome,
            dto.Telefone,
            dto.Email,
            oficinaId
        );

        var clienteCriado = await _repository.AdicionarAsync(cliente);

        return new ClienteResponseDto
        {
            Id = clienteCriado.Id,
            Nome = clienteCriado.Nome,
            Telefone = clienteCriado.Telefone,
            Email = clienteCriado.Email,
            Ativo = clienteCriado.Ativo
        };
    }

    public async Task<List<ClienteResponseDto>> ListarAsync(
        Guid oficinaId)
    {
        var clientes = await _repository.ListarAsync(oficinaId);

        return clientes.Select(cliente => new ClienteResponseDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Telefone = cliente.Telefone,
            Email = cliente.Email,
            Ativo = cliente.Ativo,
            QuantidadeVeiculos = cliente.Veiculos.Count
        }).ToList();
    }

    public async Task<ClienteDetalhadoResponseDto?> BuscarPorIdAsync(
        Guid id,
        Guid oficinaId)
    {
        var cliente = await _repository.ObterPorIdAsync(
            id,
            oficinaId);

        if (cliente == null)
            return null;

        return new ClienteDetalhadoResponseDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Telefone = cliente.Telefone,
            Email = cliente.Email,
            Ativo = cliente.Ativo,

            Veiculos = cliente.Veiculos
                .Select(v => new VeiculoResumoDto
                {
                    Id = v.Id,
                    Placa = v.Placa,
                    Marca = v.Marca,
                    Modelo = v.Modelo
                })
                .ToList()
        };
    }

    public async Task<ClienteResponseDto?> AtualizarAsync(
        Guid id,
        AtualizarClienteDto dto,
        Guid oficinaId)
    {
        var cliente = await _repository.ObterPorIdAsync(
            id,
            oficinaId);

        if (cliente == null)
            return null;

        cliente.Atualizar(
            dto.Nome,
            dto.Telefone,
            dto.Email
        );

        await _repository.AtualizarAsync(cliente);

        return new ClienteResponseDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Telefone = cliente.Telefone,
            Email = cliente.Email,
            Ativo = cliente.Ativo,
            QuantidadeVeiculos = cliente.Veiculos.Count
        };
    }

    public async Task InativarAsync(
        Guid id,
        Guid oficinaId)
    {
        var cliente = await _repository.ObterPorIdAsync(
            id,
            oficinaId);

        if (cliente == null)
            throw new Exception("Cliente não encontrado");

        cliente.Inativar();

        await _repository.AtualizarAsync(cliente);
    }

    public async Task ReativarAsync(
        Guid id,
        Guid oficinaId)
    {
        var cliente = await _repository.ObterPorIdAsync(
            id,
            oficinaId);

        if (cliente == null)
            throw new Exception("Cliente não encontrado");

        cliente.Reativar();

        await _repository.AtualizarAsync(cliente);
    }

    public async Task RemoverAsync(
        Guid id,
        Guid oficinaId)
    {
        var cliente = await _repository.ObterPorIdAsync(
            id,
            oficinaId);

        if (cliente == null)
            throw new Exception("Cliente não encontrado");

        if (cliente.OrdensServico != null &&
            cliente.OrdensServico.Any())
        {
            throw new Exception(
                "Este cliente possui ordens de serviço vinculadas e não pode ser excluído. Inative-o em vez disso.");
        }

        await _repository.RemoverAsync(cliente);
    }

    public async Task<List<ClienteHistoricoResponseDto>> BuscarHistoricoAsync(
        Guid clienteId,
        Guid oficinaId)
    {
        var cliente = await _repository.BuscarComHistoricoAsync(
            clienteId,
            oficinaId);

        if (cliente == null)
            return new List<ClienteHistoricoResponseDto>();

        return cliente.OrdensServico
            .Select(o => new ClienteHistoricoResponseDto
            {
                OrdemServicoId = o.Id,
                ValorTotal = o.ValorTotal,
                StatusAtual = o.Status,
                DataCriacao = o.DataCriacao,

                Historicos = o.Historicos
                    .OrderByDescending(h => h.DataAlteracao)
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
            })
            .ToList();
    }
}