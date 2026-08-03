using Microsoft.AspNetCore.Mvc;
using GarageManager.Application.DTOs;
using GarageManager.Application.Services;

namespace GarageManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehicleController : ControllerBase
{
    private readonly VehicleAppService _service;

    public VehicleController(VehicleAppService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateVehicleDto dto)
    {
        var vehicle = await _service.CreateAsync(dto);

        return CreatedAtAction(nameof(GetById), new { id = vehicle.Id }, vehicle);
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var vehicles = await _service.ListAsync();

        return Ok(vehicles);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var vehicle = await _service.GetByIdAsync(id);

        if (vehicle == null)
            return NotFound();

        return Ok(vehicle);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateVehicleDto dto)
    {
        var updatedVehicle = await _service.UpdateAsync(id, dto);

        if (updatedVehicle == null)
            return NotFound();

        return Ok(updatedVehicle);
    }

    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        await _service.DeactivateAsync(id);

        return NoContent();
    }

    [HttpPatch("{id}/reactivate")]
    public async Task<IActionResult> Reactivate(Guid id)
    {
        await _service.ReactivateAsync(id);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Remove(Guid id)
    {
        await _service.RemoveAsync(id);

        return NoContent();
    }
}
