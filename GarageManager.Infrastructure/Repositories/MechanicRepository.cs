using Microsoft.EntityFrameworkCore;
using GarageManager.Domain.Entities;
using GarageManager.Infrastructure.Data;

namespace GarageManager.Infrastructure.Repositories;

public class MechanicRepository
{
    private readonly GarageManagerDbContext _context;

    public MechanicRepository(GarageManagerDbContext context)
    {
        _context = context;
    }

    public async Task<List<Mechanic>> GetAllAsync()
    {
        return await _context.Mechanics
            .Include(m => m.Workshop)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Mechanic?> GetByIdAsync(Guid id)
    {
        return await _context.Mechanics
            .Include(m => m.Workshop)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task AddAsync(Mechanic mechanic)
    {
        await _context.Mechanics.AddAsync(mechanic);
    }

    public void Update(Mechanic mechanic)
    {
        _context.Mechanics.Update(mechanic);
    }

    public void Delete(Mechanic mechanic)
    {
        _context.Mechanics.Remove(mechanic);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
