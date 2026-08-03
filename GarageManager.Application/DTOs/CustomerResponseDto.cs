namespace GarageManager.Application.DTOs;

public class CustomerResponseDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public int VehicleCount { get; set; }

    public bool IsActive { get; set; }
}
