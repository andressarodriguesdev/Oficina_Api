using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Repositories;
using OficinaMecanica.Application.Constants;

namespace OficinaMecanica.Application.Services;

public class ClienteAppService
{
    private readonly ClienteRepository _repository;

    // Temporário até existir autenticação/login
   


    public ClienteAppService(ClienteRepository repository)
    {
        _repository = repository;
    }


    public async Task<ClienteResponseDto> CriarAsync(CriarClienteDto dto)
    {
        var cliente = new Cliente(
      dto.Nome,
      dto.Telefone,
      dto.Email,
      OficinaConstants.OficinaPadraoId
      );

        var clienteCriado = await _repository.AdicionarAsync(cliente);


        return new ClienteResponseDto
        {
            Id = clienteCriado.Id,
            Nome = clienteCriado.Nome,
            Telefone = clienteCriado.Telefone,
            Email = clienteCriado.Email
        };
    }


    public async Task<List<ClienteResponseDto>> ListarAsync()
    {
        var clientes = await _repository.ListarAsync();

        return clientes.Select(cliente => new ClienteResponseDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Telefone = cliente.Telefone,
            Email = cliente.Email,
            QuantidadeVeiculos = cliente.Veiculos.Count

        }).ToList();
    }


    public async Task<ClienteDetalhadoResponseDto?> BuscarPorIdAsync(Guid id)
    {
        var cliente = await _repository.ObterPorIdAsync(id);

        if (cliente == null)
            return null;


        return new ClienteDetalhadoResponseDto
        {
            Id = cliente.Id,
            Nome = cliente.Nome,
            Telefone = cliente.Telefone,
            Email = cliente.Email,

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
        AtualizarClienteDto dto)
    {
        var cliente = await _repository.ObterPorIdAsync(id);

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
            Email = cliente.Email
        };
    }


    public async Task RemoverAsync(Guid id)
    {
        var cliente = await _repository.ObterPorIdAsync(id);

        if (cliente == null)
            throw new Exception("Cliente não encontrado");


        await _repository.RemoverAsync(cliente);
    }
}