using OficinaMecanica.Application.Constants;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Repositories;


namespace OficinaMecanica.Application.Services;

public class MecanicoAppService
{
    private readonly MecanicoRepository _repository;

    public MecanicoAppService(MecanicoRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<Mecanico>> GetAllAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<Mecanico?> GetByIdAsync(Guid id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<MecanicoResponseDto> CreateAsync(MecanicoRequestDto dto)
    {
        var mecanico = new Mecanico
        {
            Id = Guid.NewGuid(),
            Nome = dto.Nome,
            Telefone = dto.Telefone ?? "",
            Especialidade = dto.Especialidade,
            Ativo = true,
            OficinaId = OficinaConstants.OficinaPadraoId
        };

        await _repository.AddAsync(mecanico);
        await _repository.SaveChangesAsync();

        return new MecanicoResponseDto
        {
            Id = mecanico.Id,
            Nome = mecanico.Nome,
            Telefone = mecanico.Telefone,
            Especialidade = mecanico.Especialidade,
            OficinaId = mecanico.OficinaId
        };
    }

    public async Task<bool> UpdateAsync(Guid id, MecanicoRequestDto dto)
    {
        var existente = await _repository.GetByIdAsync(id);

        if (existente == null)
            return false;

        existente.Nome = dto.Nome;
        existente.Telefone = dto.Telefone ?? "";
        existente.Especialidade = dto.Especialidade;

        _repository.Update(existente);
        await _repository.SaveChangesAsync();

        return true;
    }

    public async Task InativarAsync(Guid id)
    {
        var mecanico = await _repository.GetByIdAsync(id);

        if (mecanico == null)
            throw new Exception("Mecânico não encontrado");

        mecanico.Ativo = false;

        await _repository.SaveChangesAsync();
    }


    public async Task ReativarAsync(Guid id)
    {
        var mecanico = await _repository.GetByIdAsync(id);

        if (mecanico == null)
            throw new Exception("Mecânico não encontrado");

        mecanico.Ativo = true;

        await _repository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var mecanico = await _repository.GetByIdAsync(id);

        if (mecanico == null)
            return false;

        _repository.Delete(mecanico);
        await _repository.SaveChangesAsync();

        return true;
    }
}