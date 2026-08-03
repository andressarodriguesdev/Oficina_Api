using GarageManager.Api.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GarageManager.Application.DTOs;
using GarageManager.Application.Services;

namespace GarageManager.Api.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize(Policy = Policies.WorkshopStaff)]
public class CustomerController : ControllerBase
{
    private readonly CustomerAppService _service;

    public CustomerController(CustomerAppService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCustomerDto dto)
    {
        var customer = await _service.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = customer.Id },
            customer
        );
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var customers = await _service.ListAsync();

        return Ok(customers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var customer = await _service.GetByIdAsync(id);

        if (customer == null)
            return NotFound();

        return Ok(customer);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateCustomerDto dto)
    {
        var updatedCustomer = await _service.UpdateAsync(id, dto);

        if (updatedCustomer == null)
            return NotFound();

        return Ok(updatedCustomer);
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
