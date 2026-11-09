using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Api.Security;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Authorize(Roles = PerfilUsuario.Admin)]
[Route("api/auditoria")]
public class AuditoriaController : ControllerBase
{
    private readonly OficinaDbContext _context;
    private readonly OficinaAppService _oficinaService;

    public AuditoriaController(
        OficinaDbContext context,
        OficinaAppService oficinaService)
    {
        _context = context;
        _oficinaService = oficinaService;
    }

    /// <summary>Últimos registros de auditoria de cadastros da oficina do administrador.</summary>
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] int limite = 100)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return Ok(Array.Empty<object>());

        limite = Math.Clamp(limite, 1, 500);

        var logs = await _context.LogsAuditoria
            .AsNoTracking()
            .Where(l => l.OficinaId == oficina.Id)
            .OrderByDescending(l => l.CriadoEm)
            .Take(limite)
            .ToListAsync();

        return Ok(logs);
    }
}
