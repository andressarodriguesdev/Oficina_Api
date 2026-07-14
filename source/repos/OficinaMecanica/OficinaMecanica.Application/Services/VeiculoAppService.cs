using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Repositories;
using OficinaMecanica.Application.Exceptions;

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



    public async Task<VeiculoResponseDto> CriarAsync(CriarVeiculoDto dto)
    {
        var cliente = await _clienteRepository.ObterPorIdAsync(dto.ClienteId);


        if (cliente == null)
        {
            throw new ClienteNaoEncontradoException(dto.ClienteId);
        }


        // A oficina vem do cliente automaticamente
        var veiculo = new Veiculo(
            dto.Placa,
            dto.Marca,
            dto.Modelo,
            dto.Ano,
            cliente.Id,
            cliente.OficinaId
        );


        var veiculoCriado = await _repository.AdicionarAsync(veiculo);



        return MapearResponse(veiculoCriado);
    }



    public async Task<List<VeiculoResponseDto>> ListarAsync()
    {
        var veiculos = await _repository.ListarAsync();


        return veiculos
            .Select(MapearResponse)
            .ToList();
    }



    public async Task<VeiculoResponseDto?> BuscarPorIdAsync(Guid id)
    {
        var veiculo = await _repository.ObterPorIdAsync(id);


        if (veiculo == null)
            return null;


        return MapearResponse(veiculo);
    }



    public async Task<VeiculoResponseDto?> AtualizarAsync(
        Guid id,
        AtualizarVeiculoDto dto)
    {
        var veiculo = await _repository.ObterPorIdAsync(id);


        if (veiculo == null)
            return null;


        veiculo.Atualizar(
            dto.Placa,
            dto.Marca,
            dto.Ano,
            dto.Modelo
        );


        await _repository.AtualizarAsync(veiculo);


        return MapearResponse(veiculo);
    }



    public async Task RemoverAsync(Guid id)
    {
        var veiculo = await _repository.ObterPorIdAsync(id);


        if (veiculo == null)
            throw new Exception("Veículo não encontrado");


        await _repository.RemoverAsync(veiculo);
    }



    private static VeiculoResponseDto MapearResponse(Veiculo veiculo)
    {
        return new VeiculoResponseDto
        {
            Id = veiculo.Id,

            Placa = veiculo.Placa,

            Marca = veiculo.Marca,

            Modelo = veiculo.Modelo,

            Ano = veiculo.Ano,

            ClienteId = veiculo.ClienteId,

            OficinaId = veiculo.OficinaId
        };
    }
}