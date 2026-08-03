namespace GarageManager.Application.DTOs;

public class VehicleSummaryDto
{
    public Guid Id { get; set; }

    public string RegistrationNumber { get; set; } = string.Empty;

    public string Make { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;
}
