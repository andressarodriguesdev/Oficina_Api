namespace OficinaMecanica.Application.Exceptions;

/// <summary>Recurso inexistente (HTTP 404).</summary>
public class NaoEncontradoException : Exception
{
    public NaoEncontradoException(string message)
        : base(message)
    {
    }
}
