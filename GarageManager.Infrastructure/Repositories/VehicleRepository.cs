using Microsoft.EntityFrameworkCore;
using GarageManager.Domain.Entities;
using GarageManager.Infrastructure.Data;

namespace GarageManager.Infrastructure.Repositories;

public class VehicleRepository
{
    private readonly GarageManagerDbContext _context;

    public VehicleRepository(GarageManagerDbContext context)
    {
        _context = context;
    }

    public async Task<Vehicle> AddAsync(Vehicle vehicle)
    {
        _context.Vehicles.Add(vehicle);

        await _context.SaveChangesAsync();

        return vehicle;
    }

    public async Task<List<Vehicle>> ListAsync()
    {
        return await _context.Vehicles
            .Include(v => v.Customer)
            .ToListAsync();
    }

    public async Task<List<Vehicle>> ListActiveAsync()
    {
        return await _context.Vehicles
            .Where(v => v.IsActive)
            .Include(v => v.Customer)
            .ToListAsync();
    }

    public async Task<Vehicle?> GetByIdAsync(Guid id)
    {
        return await _context.Vehicles
            .Include(v => v.Customer)
            .Include(v => v.JobCards)
            .FirstOrDefaultAsync(v => v.Id == id);
    }

    public async Task UpdateAsync(Vehicle vehicle)
    {
        _context.Vehicles.Update(vehicle);

        await _context.SaveChangesAsync();
    }

}
