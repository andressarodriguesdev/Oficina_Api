using Microsoft.AspNetCore.Mvc;
using GarageManager.Application.Services;

namespace GarageManager.Api.Controllers;

[ApiController]
[Route("api/finance")]
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
