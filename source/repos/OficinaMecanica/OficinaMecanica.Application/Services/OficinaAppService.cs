using System;
using System.Collections.Generic;
using System.Text;

using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Repositories;

namespace OficinaMecanica.Application.Services;

public class OficinaAppService
{
    private readonly OficinaRepository _repository;


    public OficinaAppService(OficinaRepository repository)
    {
        _repository = repository;
    }


    public async Task<OficinaResponseDto> CriarAsync(CriarOficinaDto dto)
    {
        var oficina = new Oficina(
            dto.Nome,
            dto.Telefone,
            dto.Endereco,
            dto.Logotipo
        );


        var oficinaCriada = await _repository.AdicionarAsync(oficina);


        return MapearResponse(oficinaCriada);
    }



    public async Task<OficinaResponseDto?> ObterPorIdAsync(Guid id)
    {
        var oficina = await _repository.ObterPorIdAsync(id);

        if (oficina == null)
            return null;


        return MapearResponse(oficina);
    }



    public async Task<List<OficinaResponseDto>> ListarAsync()
    {
        var oficinas = await _repository.ListarAsync();


        return oficinas
            .Select(MapearResponse)
            .ToList();
    }



    private static OficinaResponseDto MapearResponse(Oficina oficina)
    {
        return new OficinaResponseDto
        {
            Id = oficina.Id,
            Nome = oficina.Nome,
            Telefone = oficina.Telefone,
            Endereco = oficina.Endereco,
            Logotipo = oficina.Logotipo
        };
    }
}