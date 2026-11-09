using System.Security.Claims;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Api.Services;

public class UsuarioAtualProvider : IUsuarioAtualProvider
{
    private readonly IHttpContextAccessor _accessor;

    public UsuarioAtualProvider(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public int? ObterUsuarioId()
    {
        var valor = _accessor.HttpContext?.User
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return int.TryParse(valor, out var id) ? id : null;
    }
}
