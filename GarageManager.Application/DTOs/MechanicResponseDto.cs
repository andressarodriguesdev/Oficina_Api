namespace GarageManager.Application.DTOs;

public class MechanicResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Speciality { get; set; }

    public Guid WorkshopId { get; set; }
}
