namespace OficinaMecanica.Application.Exceptions;

/// <summary>Usuário autenticado sem permissão para o recurso (HTTP 403).</summary>
public class AcessoNegadoException : Exception
{
    public AcessoNegadoException(string message)
        : base(message)
    {
    }
}
