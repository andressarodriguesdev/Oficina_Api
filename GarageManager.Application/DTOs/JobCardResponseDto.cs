using GarageManager.Domain.Enums;

namespace GarageManager.Application.DTOs;

public class JobCardResponseDto
{
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }

    public Guid VehicleId { get; set; }

    public Guid MechanicId { get; set; }

    public CustomerResponseDto? Customer { get; set; }

    public VehicleResponseDto? Vehicle { get; set; }

    public MechanicResponseDto? Mechanic { get; set; }

    public string Description { get; set; } = string.Empty;

    public decimal LabourCharge { get; set; }

    public decimal TotalAmount { get; set; }

    public List<PartDto> Parts { get; set; } = new();

    public JobCardStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? SentForApprovalAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime? CancelledAt { get; set; }

    public string? CancellationReason { get; set; }

    public DateTime? ReopenedAt { get; set; }

    public string? ReopeningReason { get; set; }

    public List<JobCardStatusChangeResponseDto> StatusChanges { get; set; } = new();
}
