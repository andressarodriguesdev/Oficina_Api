using GarageManager.Api.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using GarageManager.Application.DTOs;
using GarageManager.Application.Services;
using GarageManager.Infrastructure.Services;

namespace GarageManager.Api.Controllers;

[ApiController]
[Route("api/job-cards")]
[Authorize(Policy = Policies.WorkshopStaff)]
public class JobCardController : ControllerBase
{
    private readonly JobCardAppService _service;
    private readonly JobCardPdfService _pdfService;
    private readonly WhatsAppService _whatsAppService;

    public JobCardController(
        JobCardAppService service,
        JobCardPdfService pdfService,
        WhatsAppService whatsAppService)
    {
        _service = service;
        _pdfService = pdfService;
        _whatsAppService = whatsAppService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateJobCardDto dto)
    {
        var jobCard = await _service.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = jobCard.Id },
            jobCard
        );
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var jobCard = await _service.GetByIdAsync(id);

        if (jobCard == null)
            return NotFound();

        return Ok(jobCard);
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var jobCards = await _service.ListAsync();

        return Ok(jobCards);
    }

    [HttpPost("{id}/send-for-approval")]
    public async Task<IActionResult> SendForApproval(Guid id)
    {
        await _service.SendForApprovalAsync(id);

        return NoContent();
    }

    // Approving, declining, cancelling and reopening all move money that has already been
    // agreed with the Customer, so they stay with the Proprietor. Approve and Decline will
    // also become reachable by the Customer through a per-Job-Card capability token — the
    // Job Card id is an identifier, never a credential.
    [HttpPost("{id}/approve")]
    [Authorize(Policy = Policies.ProprietorOnly)]
    public async Task<IActionResult> Approve(Guid id)
    {
        await _service.ApproveAsync(id);

        return NoContent();
    }

    [HttpPost("{id}/decline")]
    [Authorize(Policy = Policies.ProprietorOnly)]
    public async Task<IActionResult> Decline(Guid id)
    {
        await _service.DeclineAsync(id);

        return NoContent();
    }

    [HttpPost("{id}/complete")]
    public async Task<IActionResult> Complete(Guid id)
    {
        await _service.CompleteAsync(id);

        return NoContent();
    }

    [HttpPost("{id}/cancel")]
    [Authorize(Policy = Policies.ProprietorOnly)]
    public async Task<IActionResult> Cancel(
        Guid id,
        CancelJobCardDto dto)
    {
        await _service.CancelAsync(id, dto.Reason);

        return NoContent();
    }

    [HttpPost("{id}/reopen")]
    [Authorize(Policy = Policies.ProprietorOnly)]
    public async Task<IActionResult> Reopen(
        Guid id,
        ReopenJobCardDto dto)
    {
        await _service.ReopenAsync(id, dto.Reason);

        return NoContent();
    }

    [HttpGet("{id}/status-history")]
    public async Task<IActionResult> StatusHistory(Guid id)
    {
        var statusHistory = await _service.GetStatusHistoryAsync(id);

        return Ok(statusHistory);
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GeneratePdf(Guid id)
    {
        var jobCard = await _service.GetEntityByIdAsync(id);

        if (jobCard == null)
            return NotFound();

        var pdf = _pdfService.GeneratePdf(jobCard);

        return File(
            pdf,
            "application/pdf",
            $"job-card-{id}.pdf"
        );
    }

    [HttpPost("{id}/parts")]
    public async Task<IActionResult> AddPart(
        Guid id,
        PartDto dto)
    {
        await _service.AddPartAsync(id, dto);

        return Ok(new
        {
            message = "Part added successfully"
        });
    }

    [HttpGet("{id}/whatsapp")]
    public async Task<IActionResult> GenerateWhatsAppLink(Guid id)
    {
        var jobCard = await _service.GetEntityByIdAsync(id);

        if (jobCard == null)
            return NotFound();

        var link = _whatsAppService.GenerateApprovalLink(jobCard);

        return Ok(new
        {
            link
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
    Guid id,
    UpdateJobCardDto dto)
    {
        await _service.UpdateAsync(id, dto);

        return NoContent();
    }
}
