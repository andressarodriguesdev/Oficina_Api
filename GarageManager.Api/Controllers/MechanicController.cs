using GarageManager.Api.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GarageManager.Application.DTOs;
using GarageManager.Application.Services;
using GarageManager.Domain.Entities;

namespace GarageManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = Policies.WorkshopStaff)]
public class MechanicController : ControllerBase
{
    private readonly MechanicAppService _service;

    public MechanicController(MechanicAppService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<Mechanic>>> GetAll()
    {
        var mechanics = await _service.GetAllAsync();

        return Ok(mechanics);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Mechanic>> GetById(Guid id)
    {
        var mechanic = await _service.GetByIdAsync(id);

        if (mechanic == null)
            return NotFound();

        return Ok(mechanic);
    }

    [HttpPost]
    [Authorize(Policy = Policies.ProprietorOnly)]
    public async Task<ActionResult<MechanicResponseDto>> Create(MechanicRequestDto dto)
    {
        var created = await _service.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = created.Id },
            created
        );
    }

    [HttpPut("{id}")]
    [Authorize(Policy = Policies.ProprietorOnly)]
    public async Task<IActionResult> Update(Guid id, MechanicRequestDto dto)
    {
        var updated = await _service.UpdateAsync(id, dto);

        if (!updated)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("{id}/deactivate")]
    [Authorize(Policy = Policies.ProprietorOnly)]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        await _service.DeactivateAsync(id);
        return NoContent();
    }

    [HttpPatch("{id}/reactivate")]
    [Authorize(Policy = Policies.ProprietorOnly)]
    public async Task<IActionResult> Reactivate(Guid id)
    {
        await _service.ReactivateAsync(id);
        return NoContent();
    }
}
