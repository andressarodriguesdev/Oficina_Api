namespace GarageManager.Application.DTOs;

public class WorkshopResponseDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string? Logo { get; set; }
}
