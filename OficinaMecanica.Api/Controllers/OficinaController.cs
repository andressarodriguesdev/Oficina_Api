using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Services;

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



    [HttpPost]
    public async Task<IActionResult> Criar(CriarOficinaDto dto)
    {
        var oficina = await _service.CriarAsync(dto);

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
