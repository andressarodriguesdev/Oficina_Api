namespace GarageManager.Application.DTOs;

public class CreateJobCardDto
{
    public Guid CustomerId { get; set; }

    public Guid VehicleId { get; set; }

    public Guid MechanicId { get; set; }

    public string Description { get; set; } = string.Empty;

    public decimal LabourCharge { get; set; }

    public List<PartDto> Parts { get; set; } = new();
}
