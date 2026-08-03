using System;
using System.Collections.Generic;

namespace GarageManager.Domain.Entities;

public class Customer
{
    public Guid Id { get; private set; }

    public string Name { get; private set; }

    public string Phone { get; private set; }

    public string Email { get; private set; }

    public bool IsActive { get; set; } = true;

    public Guid WorkshopId { get; private set; }

    public Workshop Workshop { get; private set; } = null!;

    public ICollection<Vehicle> Vehicles { get; private set; } = new List<Vehicle>();

    public ICollection<JobCard> JobCards { get; private set; } = new List<JobCard>();

    private Customer()
    {
        Name = string.Empty;
        Phone = string.Empty;
        Email = string.Empty;
    }

    public Customer(
        string name,
        string phone,
        string email,
        Guid workshopId)
    {
        Id = Guid.NewGuid();
        Name = name;
        Phone = phone;
        Email = email;
        WorkshopId = workshopId;

        IsActive = true;
    }

    public void Update(
        string name,
        string phone,
        string email)
    {
        Name = name;
        Phone = phone;
        Email = email;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void Reactivate()
    {
        IsActive = true;
    }
}
