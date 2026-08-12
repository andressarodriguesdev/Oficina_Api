using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Services;
using System.Security.Claims;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OficinaController : ControllerBase
{
    private readonly OficinaAppService _service;

    public OficinaController(OficinaAppService service)
    {
        _service = service;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Criar(CriarOficinaDto dto)
    {
        var usuarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!int.TryParse(usuarioIdClaim, out var usuarioId))
        {
            return Unauthorized();
        }

        var oficina = await _service.CriarAsync(dto, usuarioId);

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = oficina.Id },
            oficina
        );
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(Guid id)
    {
        var oficina = await _service.ObterPorIdAsync(id);

        if (oficina == null)
            return NotFound();

        return Ok(oficina);
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var oficinas = await _service.ListarAsync();

        return Ok(oficinas);
    }
}