using Microsoft.AspNetCore.Mvc;
using GarageManager.Application.DTOs;
using GarageManager.Application.Services;

namespace GarageManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkshopController : ControllerBase
{
    private readonly WorkshopAppService _service;

    public WorkshopController(WorkshopAppService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateWorkshopDto dto)
    {
        var workshop = await _service.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = workshop.Id },
            workshop
        );
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var workshop = await _service.GetByIdAsync(id);

        if (workshop == null)
            return NotFound();

        return Ok(workshop);
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var workshops = await _service.ListAsync();

        return Ok(workshops);
    }
}
