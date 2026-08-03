using System;

namespace GarageManager.Domain.Entities;

public class Workshop
{
    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;

    public string Phone { get; private set; } = string.Empty;

    public string Address { get; private set; } = string.Empty;

    public string? Logo { get; private set; }

    private Workshop() { }

    public Workshop(
        string name,
        string phone,
        string address,
        string? logo = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        Phone = phone;
        Address = address;
        Logo = logo;
    }
}
