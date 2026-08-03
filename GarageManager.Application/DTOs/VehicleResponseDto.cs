namespace GarageManager.Application.DTOs;

public class VehicleResponseDto
{
    public Guid Id { get; set; }

    public string RegistrationNumber { get; set; } = string.Empty;

    public string Make { get; set; } = string.Empty;

    public string Model { get; set; } = string.Empty;

    public string Year { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public Guid CustomerId { get; set; }

    public Guid WorkshopId { get; set; }
}
