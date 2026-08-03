using System;
using System.Collections.Generic;
using System.Linq;
using GarageManager.Domain.Enums;

namespace GarageManager.Domain.Entities;

public class JobCard
{
    public Guid Id { get; private set; }

    public Guid CustomerId { get; private set; }
    public Customer Customer { get; private set; } = null!;

    public Guid VehicleId { get; private set; }
    public Vehicle Vehicle { get; private set; } = null!;

    public string Description { get; private set; } = null!;

    public decimal LabourCharge { get; private set; }

    public List<Part> Parts { get; private set; } = new();

    public decimal TotalAmount => LabourCharge + Parts.Sum(p => p.Total);

    public JobCardStatus Status { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime? SentForApprovalAt { get; private set; }

    public DateTime? CompletedAt { get; private set; }

    public DateTime? CancelledAt { get; private set; }

    public string? CancellationReason { get; private set; }

    public DateTime? ReopenedAt { get; private set; }

    public string? ReopeningReason { get; private set; }

    public Guid WorkshopId { get; private set; }

    public Workshop Workshop { get; private set; } = null!;

    public Guid MechanicId { get; private set; }

    public Mechanic Mechanic { get; private set; }

    public ICollection<JobCardStatusChange> StatusChanges { get; private set; }
        = new List<JobCardStatusChange>();

    public JobCard(
        Guid workshopId,
        Guid customerId,
        Guid vehicleId,
        Guid mechanicId,
        string description,
        decimal labourCharge)
    {
        Id = Guid.NewGuid();

        WorkshopId = workshopId;

        CustomerId = customerId;

        VehicleId = vehicleId;

        MechanicId = mechanicId;

        Description = description;

        LabourCharge = labourCharge;

        Status = JobCardStatus.Open;

        CreatedAt = DateTime.UtcNow;
    }

    public void AddPart(Part part)
    {
        Parts.Add(part);
    }

    public void SendForApproval()
    {
        if (Status != JobCardStatus.Open)
            throw new Exception("Only open job cards can be sent for approval.");

        Status = JobCardStatus.AwaitingApproval;

        SentForApprovalAt = DateTime.UtcNow;
    }

    public void Approve()
    {
        if (Status != JobCardStatus.AwaitingApproval &&
            Status != JobCardStatus.Reopened)
            throw new Exception("Only job cards awaiting approval or reopened can be approved.");

        Status = JobCardStatus.Approved;
    }

    public void Decline()
    {
        if (Status != JobCardStatus.AwaitingApproval)
            throw new Exception("Only job cards awaiting approval can be declined.");

        Status = JobCardStatus.Declined;
    }

    public void Complete()
    {
        if (Status != JobCardStatus.Approved &&
            Status != JobCardStatus.Reopened)
            throw new Exception("Only approved or reopened job cards can be completed.");

        Status = JobCardStatus.Completed;

        CompletedAt = DateTime.UtcNow;
    }

    public void Cancel(string reason)
    {
        if (Status == JobCardStatus.Completed)
            throw new Exception("A completed job card cannot be cancelled.");

        if (Status == JobCardStatus.Cancelled)
            throw new Exception("This job card is already cancelled.");

        if (string.IsNullOrWhiteSpace(reason))
            throw new Exception("A cancellation reason is required.");

        Status = JobCardStatus.Cancelled;

        CancellationReason = reason;

        CancelledAt = DateTime.UtcNow;
    }

    public void Reopen(string reason)
    {
        if (Status != JobCardStatus.Completed)
            throw new Exception("Only completed job cards can be reopened.");

        if (string.IsNullOrWhiteSpace(reason))
            throw new Exception("A reopening reason is required.");

        Status = JobCardStatus.Reopened;

        ReopeningReason = reason;

        ReopenedAt = DateTime.UtcNow;
    }

    public void UpdateDetails(
        Guid customerId,
        Guid vehicleId,
        Guid mechanicId,
        string description,
        decimal labourCharge)
    {
        CustomerId = customerId;
        VehicleId = vehicleId;
        MechanicId = mechanicId;
        Description = description;
        LabourCharge = labourCharge;
    }
}
