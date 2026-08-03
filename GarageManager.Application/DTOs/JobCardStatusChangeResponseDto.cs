using GarageManager.Domain.Enums;

namespace GarageManager.Application.DTOs;

public class JobCardStatusChangeResponseDto
{
    public Guid Id { get; set; }

    public Guid JobCardId { get; set; }

    public JobCardStatus PreviousStatus { get; set; }

    public JobCardStatus NewStatus { get; set; }

    public string? Note { get; set; }

    public DateTime ChangedAt { get; set; }
}
