using System;
using GarageManager.Domain.Enums;

namespace GarageManager.Domain.Entities;

public class JobCardStatusChange
{
    public Guid Id { get; private set; }

    public Guid JobCardId { get; private set; }
    public JobCard JobCard { get; private set; } = null!;

    public JobCardStatus PreviousStatus { get; private set; }

    public JobCardStatus NewStatus { get; private set; }

    public string? Note { get; private set; }

    public DateTime ChangedAt { get; private set; }

    private JobCardStatusChange()
    {
    }

    public JobCardStatusChange(
        Guid jobCardId,
        JobCardStatus previousStatus,
        JobCardStatus newStatus,
        string? note = null)
    {
        Id = Guid.NewGuid();
        JobCardId = jobCardId;
        PreviousStatus = previousStatus;
        NewStatus = newStatus;
        Note = note;
        ChangedAt = DateTime.UtcNow;
    }
}
