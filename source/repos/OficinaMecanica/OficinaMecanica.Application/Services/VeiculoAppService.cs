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

        var veiculo = new Veiculo(dto.Placa, dto.Marca, dto.Modelo, dto.ClienteId);

        var veiculoCriado = await _repository.AdicionarAsync(veiculo);


        return new VeiculoResponseDto

        {

            Id = veiculoCriado.Id,

            Placa = veiculoCriado.Placa,

            Marca = veiculoCriado.Marca,

            Modelo = veiculoCriado.Modelo,

            ClienteId = veiculoCriado.ClienteId

        };

    }

    public async Task<List<VeiculoResponseDto>> ListarAsync()

    {

        var veiculos = await _repository.ListarAsync();

        return veiculos.Select(v => new VeiculoResponseDto

        {

            Id = v.Id,

            Placa = v.Placa,

            Marca = v.Marca,

            Modelo = v.Modelo,

            ClienteId = v.ClienteId

        }).ToList();

    }

    public async Task<VeiculoResponseDto?> BuscarPorIdAsync(Guid id)

    {

        var veiculo = await _repository.ObterPorIdAsync(id);

        if (veiculo == null)

            return null;

        return new VeiculoResponseDto

        {

            Id = veiculo.Id,

            Placa = veiculo.Placa,

            Marca = veiculo.Marca,

            Modelo = veiculo.Modelo,

            ClienteId = veiculo.ClienteId

        };

    }

    public async Task<VeiculoResponseDto?> AtualizarAsync(Guid id, AtualizarVeiculoDto dto)

    {

        var veiculo = await _repository.ObterPorIdAsync(id);

        if (veiculo == null)

            return null;

        veiculo.Atualizar(dto.Placa, dto.Marca, dto.Modelo);

        await _repository.AtualizarAsync(veiculo);

        return new VeiculoResponseDto

        {

            Id = veiculo.Id,

            Placa = veiculo.Placa,

            Marca = veiculo.Marca,

            Modelo = veiculo.Modelo,

            ClienteId = veiculo.ClienteId

        };

    }

    public async Task RemoverAsync(Guid id)

    {

        var veiculo = await _repository.ObterPorIdAsync(id);

        if (veiculo == null)

            throw new Exception("Veículo não encontrado");

        await _repository.RemoverAsync(veiculo);

    }

}