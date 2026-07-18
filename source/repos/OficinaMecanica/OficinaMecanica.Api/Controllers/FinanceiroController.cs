using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Application.Services;

namespace OficinaMecanica.Api.Controllers;


[ApiController]
[Route("api/financeiro")]
public class FinanceiroController : ControllerBase
{

    private readonly FinanceiroAppService _service;


    public FinanceiroController(
        FinanceiroAppService service)
    {
        _service = service;
    }



    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var resultado = await _service.ObterAsync();

        return Ok(resultado);
    }
}