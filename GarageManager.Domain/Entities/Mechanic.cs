using System;

namespace GarageManager.Domain.Entities;

public class Mechanic
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string? Speciality { get; set; }

    public bool IsActive { get; set; } = true;

    public Guid WorkshopId { get; set; }

    public Workshop Workshop { get; set; } = null!;
}
