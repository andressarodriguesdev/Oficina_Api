using GarageManager.Api.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GarageManager.Application.Services;

namespace GarageManager.Api.Controllers;

/// <remarks>
/// The consolidated figures are the Proprietor's alone. Note that this does not hide
/// money from a Mechanic entirely: GET /api/job-cards still returns LabourCharge and
/// each Part's unit price, so a Mechanic can add up what they can already see. That is a
/// deliberate product choice, recorded in reference/matriz-de-permissoes.html.
/// </remarks>
[ApiController]
[Route("api/finance")]
[Authorize(Policy = Policies.ProprietorOnly)]
public class FinanceController : ControllerBase
{
    private readonly FinanceAppService _service;

    public FinanceController(
        FinanceAppService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _service.GetAsync();

        return Ok(result);
    }
}
