using OficinaMecanica.Application.Constants;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.DTOs.Mecanico;
using OficinaMecanica.Application.DTOs.Mecanicos;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Domain.Enums;
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

    public async Task<MecanicoDetalhadoResponseDto?> GetByIdAsync(Guid id)
    {
        var mecanico = await _repository.GetByIdAsync(id);

        if (mecanico == null)
            return null;


        return new MecanicoDetalhadoResponseDto
        {
            Id = mecanico.Id,
            Nome = mecanico.Nome,
            Telefone = mecanico.Telefone,
            Especialidade = mecanico.Especialidade,
            Ativo = mecanico.Ativo,
            OficinaId = mecanico.OficinaId,
            Oficina = mecanico.Oficina,

            QuantidadeOrdensServico = mecanico.OrdensServico.Count(),

            QuantidadeConcluidas = mecanico.OrdensServico
                .Count(o => o.Status == StatusOrdemServico.Concluida),

            QuantidadeCanceladas = mecanico.OrdensServico
                .Count(o => o.Status == StatusOrdemServico.Cancelada),

            TotalMaoObra = mecanico.OrdensServico
                .Where(o => o.Status == StatusOrdemServico.Concluida)
                .Sum(o => o.ValorMaoObra),

            OrdensServico = mecanico.OrdensServico
                .Select(o => new MecanicoOrdemServicoResumoDto
                {
                    OrdemServicoId = o.Id,
                    ClienteNome = o.Cliente.Nome,
                    Veiculo = $"{o.Veiculo.Marca} {o.Veiculo.Modelo}",
                    ValorMaoObra = o.ValorMaoObra,
                    Status = o.Status,
                    DataCriacao = o.DataCriacao,
                    DataConclusao = o.DataConclusao
                })
                .ToList()
        };
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