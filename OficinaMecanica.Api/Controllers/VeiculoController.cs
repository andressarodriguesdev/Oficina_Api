using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OficinaMecanica.Api.Security;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Services;

namespace OficinaMecanica.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VeiculoController : ControllerBase
{
    private readonly VeiculoAppService _service;
    private readonly OficinaAppService _oficinaService;
    private readonly EscopoMecanicoService _escopo;

    public VeiculoController(
        VeiculoAppService service,
        OficinaAppService oficinaService,
        EscopoMecanicoService escopo)
    {
        _service = service;
        _oficinaService = oficinaService;
        _escopo = escopo;
    }

    // Mecânico só enxerga, no veículo, as OS atribuídas a ele
    private async Task RestringirOrdensAsync(params VeiculoResponseDto?[] veiculos)
    {
        var escopo = await _escopo.ObterMecanicoRestritoAsync(User.GetUsuarioId());

        if (!escopo.HasValue)
            return;

        foreach (var veiculo in veiculos)
        {
            if (veiculo == null)
                continue;

            veiculo.OrdensServico = veiculo.OrdensServico
                .Where(o => o.MecanicoId == escopo.Value)
                .ToList();
        }
    }

    [HttpPost]
    public async Task<IActionResult> Criar(
        CriarVeiculoDto dto)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var veiculo = await _service.CriarAsync(
            dto,
            oficina.Id
        );

        return CreatedAtAction(
            nameof(ObterPorId),
            new { id = veiculo.Id },
            veiculo
        );
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var veiculos = await _service.ListarAsync(
            oficina.Id
        );

        await RestringirOrdensAsync(veiculos.ToArray());

        return Ok(veiculos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> ObterPorId(
        Guid id)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var veiculo = await _service.BuscarPorIdAsync(
            id,
            oficina.Id
        );

        if (veiculo == null)
            return NotFound();

        await RestringirOrdensAsync(veiculo);

        return Ok(veiculo);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(
        Guid id,
        AtualizarVeiculoDto dto)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        var veiculoAtualizado = await _service.AtualizarAsync(
            id,
            dto,
            oficina.Id
        );

        if (veiculoAtualizado == null)
            return NotFound();

        await RestringirOrdensAsync(veiculoAtualizado);

        return Ok(veiculoAtualizado);
    }

    [HttpPatch("{id}/inativar")]
    public async Task<IActionResult> Inativar(
        Guid id)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        await _service.InativarAsync(
            id,
            oficina.Id
        );

        return NoContent();
    }

    [HttpPatch("{id}/reativar")]
    public async Task<IActionResult> Reativar(
        Guid id)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        await _service.ReativarAsync(
            id,
            oficina.Id
        );

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = OficinaMecanica.Domain.Entities.PerfilUsuario.Admin)]
    public async Task<IActionResult> Remover(
        Guid id)
    {
        var oficina = await _oficinaService.ObterParaUsuarioAsync(User.GetUsuarioId());

        if (oficina == null)
            return BadRequest(
                "Nenhuma oficina cadastrada no sistema."
            );

        await _service.RemoverAsync(
            id,
            oficina.Id
        );

        return NoContent();
    }
}