namespace OficinaMecanica.Infrastructure.Data;

/// <summary>Identifica o usuário autenticado da requisição atual (usado na auditoria).</summary>
public interface IUsuarioAtualProvider
{
    int? ObterUsuarioId();
}
