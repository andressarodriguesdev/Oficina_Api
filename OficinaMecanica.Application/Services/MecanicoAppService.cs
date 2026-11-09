using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.DTOs.Mecanico;
using OficinaMecanica.Application.DTOs.Mecanicos;
using OficinaMecanica.Application.Exceptions;
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

    /// <summary>
    /// Cria o login de um mecânico (perfil Mecanico) já vinculado ao cadastro dele.
    /// A senha chega já com hash. Uso restrito a administradores.
    /// </summary>
    public async Task CriarAcessoAsync(
        Guid mecanicoId,
        Guid oficinaId,
        string email,
        string senhaHash)
    {
        var mecanico = await _repository.ObterSimplesAsync(mecanicoId);

        if (mecanico == null || mecanico.OficinaId != oficinaId)
            throw new NaoEncontradoException("Mecânico não encontrado.");

        if (!mecanico.Ativo)
            throw new RegraNegocioException(
                "Não é possível criar acesso para um mecânico inativo.");

        email = (email ?? string.Empty).Trim().ToLower();

        if (!email.Contains('@') || email.Length < 5)
            throw new RegraNegocioException("Informe um e-mail válido.");

        if (await _repository.MecanicoJaVinculadoAsync(mecanicoId))
            throw new RegraNegocioException(
                "Este mecânico já possui um acesso ao sistema.");

        if (await _repository.ObterUsuarioPorEmailParaAtualizacaoAsync(email) != null)
            throw new RegraNegocioException(
                "Já existe um usuário cadastrado com este e-mail.");

        var usuario = new Usuario
        {
            Nome = mecanico.Nome,
            Email = email,
            SenhaHash = senhaHash,
            DataCadastro = DateTime.UtcNow,
            Ativo = true,
            EmailVerificado = true,
            Perfil = PerfilAcesso.Mecanico,
            MecanicoId = mecanicoId
        };

        await _repository.AdicionarUsuarioAsync(usuario);
        await _repository.SaveChangesAsync();
    }

    /// <summary>
    /// Vincula um usuário já cadastrado (e-mail verificado) a um mecânico,
    /// concedendo o perfil Mecanico. Uso restrito a administradores.
    /// </summary>
    public async Task VincularUsuarioAsync(
        Guid mecanicoId,
        Guid oficinaId,
        string email)
    {
        var mecanico = await _repository.ObterSimplesAsync(mecanicoId);

        if (mecanico == null || mecanico.OficinaId != oficinaId)
            throw new NaoEncontradoException("Mecânico não encontrado.");

        if (!mecanico.Ativo)
            throw new RegraNegocioException(
                "Não é possível vincular um usuário a um mecânico inativo.");

        var usuario = await _repository.ObterUsuarioPorEmailParaAtualizacaoAsync(
            (email ?? string.Empty).Trim().ToLower())
            ?? throw new NaoEncontradoException("Usuário não encontrado.");

        if (!usuario.Ativo || !usuario.EmailVerificado)
            throw new RegraNegocioException(
                "O usuário precisa estar ativo e com o e-mail verificado.");

        if (usuario.Oficinas.Any())
            throw new RegraNegocioException(
                "O usuário é dono de uma oficina e não pode virar mecânico.");

        if (usuario.MecanicoId.HasValue && usuario.MecanicoId != mecanicoId)
            throw new RegraNegocioException(
                "O usuário já está vinculado a outro mecânico.");

        if (usuario.MecanicoId != mecanicoId &&
            await _repository.MecanicoJaVinculadoAsync(mecanicoId))
            throw new RegraNegocioException(
                "Este mecânico já possui um usuário vinculado.");

        usuario.Perfil = PerfilAcesso.Mecanico;
        usuario.MecanicoId = mecanicoId;

        await _repository.SaveChangesAsync();
    }

    public async Task<List<Mecanico>> GetAllAsync(
        Guid oficinaId)
    {
        return await _repository.GetAllAsync(oficinaId);
    }

    public async Task<MecanicoDetalhadoResponseDto?> GetByIdAsync(
        Guid id,
        Guid oficinaId)
    {
        var mecanico = await _repository.GetByIdAsync(
            id,
            oficinaId
        );

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

            QuantidadeOrdensServico =
                mecanico.OrdensServico.Count(),

            QuantidadeConcluidas =
                mecanico.OrdensServico.Count(
                    o => o.Status == StatusOrdemServico.Concluida),

            QuantidadeCanceladas =
                mecanico.OrdensServico.Count(
                    o => o.Status == StatusOrdemServico.Cancelada),

            TotalMaoObra =
                mecanico.OrdensServico
                    .Where(
                        o => o.Status == StatusOrdemServico.Concluida)
                    .Sum(o => o.ValorMaoObra),

            OrdensServico =
                mecanico.OrdensServico
                    .Select(o => new MecanicoOrdemServicoResumoDto
                    {
                        OrdemServicoId = o.Id,
                        ClienteNome = o.Cliente.Nome,
                        Veiculo =
                            $"{o.Veiculo.Marca} {o.Veiculo.Modelo}",
                        ValorMaoObra = o.ValorMaoObra,
                        Status = o.Status,
                        DataCriacao = o.DataCriacao,
                        DataConclusao = o.DataConclusao
                    })
                    .ToList()
        };
    }

    public async Task<MecanicoResponseDto> CreateAsync(
        MecanicoRequestDto dto,
        Guid oficinaId)
    {
        var mecanico = new Mecanico
        {
            Id = Guid.NewGuid(),
            Nome = dto.Nome,
            Telefone = dto.Telefone ?? "",
            Especialidade = dto.Especialidade,
            Ativo = true,
            OficinaId = oficinaId
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

    public async Task<bool> UpdateAsync(
        Guid id,
        MecanicoRequestDto dto,
        Guid oficinaId)
    {
        var existente = await _repository.GetByIdAsync(
            id,
            oficinaId
        );

        if (existente == null)
            return false;

        existente.Nome = dto.Nome;
        existente.Telefone = dto.Telefone ?? "";
        existente.Especialidade = dto.Especialidade;

        _repository.Update(existente);

        await _repository.SaveChangesAsync();

        return true;
    }

    public async Task InativarAsync(
        Guid id,
        Guid oficinaId)
    {
        var mecanico = await _repository.GetByIdAsync(
            id,
            oficinaId
        );

        if (mecanico == null)
            throw new NaoEncontradoException("Mecânico não encontrado");

        mecanico.Ativo = false;

        await _repository.SaveChangesAsync();
    }

    public async Task ReativarAsync(
        Guid id,
        Guid oficinaId)
    {
        var mecanico = await _repository.GetByIdAsync(
            id,
            oficinaId
        );

        if (mecanico == null)
            throw new NaoEncontradoException("Mecânico não encontrado");

        mecanico.Ativo = true;

        await _repository.SaveChangesAsync();
    }

    public async Task<bool> DeleteAsync(
        Guid id,
        Guid oficinaId)
    {
        var mecanico = await _repository.GetByIdAsync(
            id,
            oficinaId
        );

        if (mecanico == null)
            return false;

        _repository.Delete(mecanico);

        await _repository.SaveChangesAsync();

        return true;
    }
}