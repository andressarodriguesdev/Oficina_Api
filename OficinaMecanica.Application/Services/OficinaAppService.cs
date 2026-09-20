using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.DTOs.Oficina;
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

    public async Task<OficinaResponseDto> CriarAsync(
        CriarOficinaDto dto,
        int usuarioId)
    {
        var oficina = new Oficina(
            usuarioId,
            dto.Nome,
            dto.RazaoSocial,
            dto.Cnpj,
            dto.InscricaoEstadual,
            dto.Telefone,
            dto.Email,
            dto.Cep,
            dto.Logradouro,
            dto.Numero,
            dto.Complemento,
            dto.Bairro,
            dto.Cidade,
            dto.Uf,
            dto.Endereco,
            dto.Logotipo);

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

    public async Task<OficinaResponseDto?> ObterPorUsuarioIdAsync(int usuarioId)
    {
        var oficina = await _repository.ObterPorUsuarioIdAsync(usuarioId);

        if (oficina == null)
            return null;

        return MapearResponse(oficina);
    }

    public async Task<OficinaResponseDto?> ObterUnicaAsync()
    {
        var oficina = await _repository.ObterUnicaAsync();

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

    public async Task<OficinaResponseDto?> AtualizarAsync(
        Guid id,
        AtualizarOficinaDto dto)
    {
        var oficina = await _repository.ObterPorIdAsync(id);

        if (oficina == null)
            return null;

        oficina.AtualizarDados(
            dto.Nome,
            dto.RazaoSocial,
            dto.Cnpj,
            dto.InscricaoEstadual,
            dto.Telefone,
            dto.Email,
            dto.Cep,
            dto.Logradouro,
            dto.Numero,
            dto.Complemento,
            dto.Bairro,
            dto.Cidade,
            dto.Uf,
            dto.Endereco,
            dto.Logotipo);

        await _repository.AtualizarAsync(oficina);

        return MapearResponse(oficina);
    }

    private static OficinaResponseDto MapearResponse(Oficina oficina)
    {
        return new OficinaResponseDto
        {
            Id = oficina.Id,
            Nome = oficina.Nome,
            RazaoSocial = oficina.RazaoSocial,
            Cnpj = oficina.Cnpj,
            InscricaoEstadual = oficina.InscricaoEstadual,
            Telefone = oficina.Telefone,
            Email = oficina.Email,
            Cep = oficina.Cep,
            Logradouro = oficina.Logradouro,
            Numero = oficina.Numero,
            Complemento = oficina.Complemento,
            Bairro = oficina.Bairro,
            Cidade = oficina.Cidade,
            Uf = oficina.Uf,
            Endereco = oficina.Endereco,
            Logotipo = oficina.Logotipo
        };
    }
}