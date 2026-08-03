using System;
using System.Collections.Generic;

namespace GarageManager.Domain.Entities;

public class Vehicle
{
    public Guid Id { get; private set; }
    public string RegistrationNumber { get; private set; }
    public string Make { get; private set; }
    public string Model { get; private set; }
    public string Year { get; private set; }
    public bool IsActive { get; set; } = true;

    public Guid CustomerId { get; private set; }
    public Customer Customer { get; private set; } = null!;
    public Guid WorkshopId { get; private set; }
    public Workshop Workshop { get; private set; } = null!;
    public ICollection<JobCard> JobCards { get; private set; } = new List<JobCard>();

    public Vehicle(
        string registrationNumber,
        string make,
        string model,
        string year,
        Guid customerId,
        Guid workshopId)
    {
        Id = Guid.NewGuid();
        RegistrationNumber = registrationNumber;
        Make = make;
        Model = model;
        Year = year;
        CustomerId = customerId;
        WorkshopId = workshopId;

        IsActive = true;
    }

    private Vehicle()
    {
        RegistrationNumber = string.Empty;
        Make = string.Empty;
        Model = string.Empty;
        Year = string.Empty;
        Customer = null!;
        Workshop = null!;
    }

    public void Update(
        string registrationNumber,
        string make,
        string model,
        string year)
    {
        RegistrationNumber = registrationNumber;
        Make = make;
        Model = model;
        Year = year;
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
