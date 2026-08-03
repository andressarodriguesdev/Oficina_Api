using System;

namespace GarageManager.Domain.Entities;

public class Part
{
    public Guid Id { get; private set; }

    public Guid JobCardId { get; private set; }

    public JobCard JobCard { get; private set; } = null!;

    public string Description { get; private set; } = string.Empty;

    public int Quantity { get; private set; }

    public decimal UnitPrice { get; private set; }

    public decimal Total => Quantity * UnitPrice;

    private Part()
    {
    }

    public Part(
        string description,
        int quantity,
        decimal unitPrice)
    {
        Id = Guid.NewGuid();

        Description = description;
        Quantity = quantity;
        UnitPrice = unitPrice;
    }
}
