using System.Security.Claims;

namespace OficinaMecanica.Api.Security;

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Id do usuário autenticado, lido somente do JWT validado (nunca do corpo da requisição).
    /// </summary>
    /// <exception cref="UnauthorizedAccessException">Token sem identificador válido (HTTP 401).</exception>
    public static int GetUsuarioId(this ClaimsPrincipal user)
    {
        var valor = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(valor, out var usuarioId))
            throw new UnauthorizedAccessException("Token sem identificação de usuário válida.");

        return usuarioId;
    }
}
