using GarageManager.Application.DTOs;
using GarageManager.Domain.Enums;
using GarageManager.Infrastructure.Repositories;

namespace GarageManager.Application.Services;

public class FinanceAppService
{
    private readonly JobCardRepository _repository;

    public FinanceAppService(
        JobCardRepository repository)
    {
        _repository = repository;
    }

    public async Task<FinanceResponseDto> GetAsync()
    {
        var jobCards = await _repository.ListForFinanceAsync();

        var completedJobCards = jobCards
            .Where(j => j.Status == JobCardStatus.Completed)
            .ToList();

        var pendingJobCards = jobCards
            .Where(j =>
                j.Status == JobCardStatus.Open ||
                j.Status == JobCardStatus.AwaitingApproval)
            .ToList();

        var cancelledJobCards = jobCards
            .Where(j => j.Status == JobCardStatus.Cancelled)
            .ToList();

        var result = new FinanceResponseDto();

        result.JobCardCount = jobCards.Count;

        result.TotalInvoiced = completedJobCards
            .Sum(j => j.TotalAmount);

        result.TotalLabour = completedJobCards
            .Sum(j => j.LabourCharge);

        result.TotalParts = completedJobCards
            .SelectMany(j => j.Parts)
            .Sum(p => p.Quantity * p.UnitPrice);

        result.CompletedCount = completedJobCards.Count;

        result.PendingCount = pendingJobCards.Count;

        result.CancelledCount = cancelledJobCards.Count;

        result.TotalForecast = pendingJobCards
            .Sum(j => j.TotalAmount);

        result.JobCards = jobCards.Select(j => new FinanceJobCardDto
        {
            Id = j.Id,

            Customer = j.Customer.Name,

            Vehicle = $"{j.Vehicle.Make} {j.Vehicle.Model}",

            Labour = j.LabourCharge,

            Parts = j.Parts.Sum(p => p.Quantity * p.UnitPrice),

            Total = j.TotalAmount,

            Status = (int)j.Status,

            Date = j.CreatedAt

        }).ToList();

        return result;
    }
}
