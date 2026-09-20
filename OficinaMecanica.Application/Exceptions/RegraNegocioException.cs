namespace OficinaMecanica.Application.Exceptions;

public class RegraNegocioException : Exception
{
    public RegraNegocioException(string message)
        : base(message)
    {
    }
}