using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Repositories;
using OficinaMecanica.Application.DTOs;
namespace OficinaMecanica.Application.Services;

public class ClienteAppService { 
    private readonly ClienteRepository _repository; 
    public ClienteAppService(ClienteRepository repository) { _repository = repository; } 
    public async Task<ClienteResponseDto> CriarAsync(CriarClienteDto dto) { 
        var cliente = new Cliente
            (
            dto.Nome,
            dto.Telefone, 
            dto.OficinaId
            );
        var clienteCriado = await _repository.
            AdicionarAsync(cliente);
        return new ClienteResponseDto {
            Id = clienteCriado.Id, 
            Nome = clienteCriado.Nome, 
            Telefone = clienteCriado.Telefone, 
        }; 
    } 
    public async Task<List<Cliente>> ListarAsync() { 
        return await _repository.ListarAsync();
    } 
    public async Task<ClienteDetalhadoResponseDto?> BuscarPorIdAsync(Guid id) {
        var cliente = await _repository.ObterPorIdAsync(id);
        if (cliente == null) return null;
        return new ClienteDetalhadoResponseDto {
            Id = cliente.Id,
            Nome = cliente.Nome, 
            Telefone = cliente.Telefone,
           
            Veiculos = cliente.Veiculos.Select(v => new VeiculoResumoDto {
                Id = v.Id, 
                Placa = v.Placa,
                Marca = v.Marca,
                Modelo = v.Modelo 
            })
            .ToList()
        }; 
    } public async Task<ClienteResponseDto?> AtualizarAsync(Guid id, AtualizarClienteDto dto) { 
        var cliente = await _repository.ObterPorIdAsync(id); 
        if (cliente == null) return null; 
        cliente.Atualizar(dto.Nome, dto.Telefone);
        await _repository.AtualizarAsync(cliente); 
        return new ClienteResponseDto {
            Id = cliente.Id,
            Nome = cliente.Nome, 
            Telefone = cliente.Telefone 
        }; 
    } 
    public async Task RemoverAsync(Guid id) {
        var cliente = await _repository.ObterPorIdAsync(id); 
        if (cliente == null) throw new Exception("Cliente não encontrado"); 
    await _repository.RemoverAsync(cliente); 
   
    } 
}