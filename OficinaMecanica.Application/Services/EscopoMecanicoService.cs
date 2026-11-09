using OficinaMecanica.Application.Exceptions;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Repositories;

namespace OficinaMecanica.Application.Services;

/// <summary>
/// Resolve, a partir do usuário autenticado (id vindo do JWT), o escopo de acesso
/// às Ordens de Serviço. O perfil e o vínculo com o mecânico são sempre lidos do
/// banco, nunca de dados enviados pelo frontend.
/// </summary>
public class EscopoMecanicoService
{
    public const string MensagemSomenteProprias =
        "Você só pode acessar ordens de serviço atribuídas a você.";

    private readonly MecanicoRepository _repository;

    public EscopoMecanicoService(MecanicoRepository repository)
    {
        _repository = repository;
    }

    /// <returns>
    /// null para Admin (sem restrição); o Id do mecânico para o perfil Mecanico.
    /// </returns>
    /// <exception cref="AcessoNegadoException">
    /// Usuário inexistente/inativo, perfil desconhecido, sem vínculo com mecânico
    /// ou com mecânico inativo/inexistente.
    /// </exception>
    public async Task<Guid?> ObterMecanicoRestritoAsync(int usuarioId)
    {
        var usuario = await _repository.ObterUsuarioAsync(usuarioId);

        if (usuario == null || !usuario.Ativo)
            throw new AcessoNegadoException("Usuário inválido ou inativo.");

        if (usuario.Perfil == PerfilAcesso.Admin)
            return null;

        if (usuario.Perfil != PerfilAcesso.Mecanico || !usuario.MecanicoId.HasValue)
            throw new AcessoNegadoException(
                "Seu usuário não está vinculado a um cadastro de mecânico.");

        var mecanico = await _repository.ObterSimplesAsync(usuario.MecanicoId.Value);

        if (mecanico == null || !mecanico.Ativo)
            throw new AcessoNegadoException(
                "O cadastro de mecânico vinculado ao seu usuário está inativo ou não existe.");

        return mecanico.Id;
    }

    public async Task<string?> ObterNomeUsuarioAsync(int usuarioId)
    {
        var usuario = await _repository.ObterUsuarioAsync(usuarioId);

        return usuario?.Nome;
    }

    public void GarantirAcesso(OrdemServico ordem, Guid? mecanicoRestrito)
    {
        if (mecanicoRestrito.HasValue && ordem.MecanicoId != mecanicoRestrito.Value)
            throw new AcessoNegadoException(MensagemSomenteProprias);
    }

    /// <summary>
    /// Para criação/edição: mecânico só pode se atribuir; Guid.Empty vira o próprio.
    /// </summary>
    public Guid ResolverMecanicoResponsavel(Guid? mecanicoRestrito, Guid mecanicoInformado)
    {
        if (!mecanicoRestrito.HasValue)
            return mecanicoInformado;

        if (mecanicoInformado != Guid.Empty && mecanicoInformado != mecanicoRestrito.Value)
            throw new AcessoNegadoException(
                "Você não pode atribuir ordens de serviço a outro mecânico.");

        return mecanicoRestrito.Value;
    }
}
