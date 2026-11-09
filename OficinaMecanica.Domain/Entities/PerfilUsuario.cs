namespace OficinaMecanica.Domain.Entities;

/// <summary>
/// Perfil de acesso gravado em Usuario.Perfil (coluna inteira que já existe no banco).
/// Os valores numéricos NÃO devem mudar.
/// </summary>
public enum PerfilAcesso
{
    Admin = 1,
    Mecanico = 2
}

/// <summary>Nomes das roles usadas no JWT e em [Authorize(Roles = ...)].</summary>
public static class PerfilUsuario
{
    public const string Admin = nameof(PerfilAcesso.Admin);
    public const string Mecanico = nameof(PerfilAcesso.Mecanico);
}
