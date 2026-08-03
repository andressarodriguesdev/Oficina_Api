namespace GarageManager.Application.DTOs;

public class UpdateJobCardDto
{
    public Guid CustomerId { get; set; }

    public Guid VehicleId { get; set; }

    public string Description { get; set; } = string.Empty;

    public decimal LabourCharge { get; set; }

    public Guid MechanicId { get; set; }
}
