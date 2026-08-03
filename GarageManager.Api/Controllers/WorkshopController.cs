using GarageManager.Api.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GarageManager.Application.DTOs;
using GarageManager.Application.Services;

namespace GarageManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = Policies.WorkshopStaff)]
public class WorkshopController : ControllerBase
{
    private readonly WorkshopAppService _service;

    public WorkshopController(WorkshopAppService service)
    {
        _service = service;
    }

    // Creating and listing Workshops are installer acts, and this installation serves one
    // Workshop (docs/adr/0001). They are locked to the Proprietor here because no
    // installer account exists; both should leave the API once sprint 5 automates
    // provisioning.
    [HttpPost]
    [Authorize(Policy = Policies.ProprietorOnly)]
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
    [Authorize(Policy = Policies.ProprietorOnly)]
    public async Task<IActionResult> List()
    {
        var workshops = await _service.ListAsync();

        return Ok(workshops);
    }
}
