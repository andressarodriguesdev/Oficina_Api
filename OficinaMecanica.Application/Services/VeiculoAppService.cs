using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Exceptions;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Repositories;

namespace OficinaMecanica.Application.Services;

public class VeiculoAppService
{
    private readonly ClienteRepository _clienteRepository;
    private readonly VeiculoRepository _repository;

    public VeiculoAppService(
        VeiculoRepository repository,
        ClienteRepository clienteRepository)
    {
        _repository = repository;
        _clienteRepository = clienteRepository;
    }

    public async Task<VeiculoResponseDto> CriarAsync(
        CriarVeiculoDto dto,
        Guid oficinaId)
    {
        var cliente = await _clienteRepository.ObterPorIdAsync(
            dto.ClienteId,
            oficinaId
        );

        if (cliente == null)
        {
            throw new ClienteNaoEncontradoException(dto.ClienteId);
        }

        var veiculo = new Veiculo(
            dto.Placa,
            dto.Marca,
            dto.Modelo,
            dto.Ano,
            cliente.Id,
            oficinaId
        );

        var veiculoCriado = await _repository.AdicionarAsync(veiculo);

        return MapearResponse(veiculoCriado);
    }

    public async Task<List<VeiculoResponseDto>> ListarAsync(
        Guid oficinaId)
    {
        var veiculos = await _repository.ListarAsync(
            oficinaId
        );

        return veiculos
            .Select(MapearResponse)
            .ToList();
    }

    public async Task<VeiculoResponseDto?> BuscarPorIdAsync(
        Guid id,
        Guid oficinaId)
    {
        var veiculo = await _repository.ObterPorIdAsync(
            id,
            oficinaId
        );

        if (veiculo == null)
            return null;

        return MapearResponse(veiculo);
    }

    public async Task<VeiculoResponseDto?> AtualizarAsync(
        Guid id,
        AtualizarVeiculoDto dto,
        Guid oficinaId)
    {
        var veiculo = await _repository.ObterPorIdAsync(
            id,
            oficinaId
        );

        if (veiculo == null)
            return null;

        veiculo.Atualizar(
            dto.Placa,
            dto.Marca,
            dto.Modelo,
            dto.Ano
        );

        await _repository.AtualizarAsync(veiculo);

        return MapearResponse(veiculo);
    }

    public async Task InativarAsync(
        Guid id,
        Guid oficinaId)
    {
        var veiculo = await _repository.ObterPorIdAsync(
            id,
            oficinaId
        );

        if (veiculo == null)
            throw new Exception("Veículo não encontrado");

        veiculo.Inativar();

        await _repository.AtualizarAsync(veiculo);
    }

    public async Task ReativarAsync(
        Guid id,
        Guid oficinaId)
    {
        var veiculo = await _repository.ObterPorIdAsync(
            id,
            oficinaId
        );

        if (veiculo == null)
            throw new Exception("Veículo não encontrado");

        veiculo.Reativar();

        await _repository.AtualizarAsync(veiculo);
    }

    public async Task RemoverAsync(
        Guid id,
        Guid oficinaId)
    {
        var veiculo = await _repository.ObterPorIdAsync(
            id,
            oficinaId
        );

        if (veiculo == null)
            throw new Exception("Veículo não encontrado");

        if (veiculo.OrdensServico.Any())
        {
            throw new Exception(
                "Este veículo possui ordens de serviço vinculadas e não pode ser excluído. Inative-o em vez disso.");
        }

        await _repository.RemoverAsync(veiculo);
    }

    private static VeiculoResponseDto MapearResponse(
        Veiculo veiculo)
    {
        return new VeiculoResponseDto
        {
            Id = veiculo.Id,
            Placa = veiculo.Placa,
            Marca = veiculo.Marca,
            Modelo = veiculo.Modelo,
            Ano = veiculo.Ano,
            ClienteId = veiculo.ClienteId,
            OficinaId = veiculo.OficinaId,
            Ativo = veiculo.Ativo,

            OrdensServico = veiculo.OrdensServico
                .Select(o => new VeiculoOrdemServicoResumoDto
                {
                    OrdemServicoId = o.Id,
                    ValorTotal = o.ValorTotal,
                    StatusAtual = (int)o.Status,
                    DataCriacao = o.DataCriacao,
                    DataConclusao = o.DataConclusao
                })
                .ToList()
        };
    }
}