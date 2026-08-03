using Microsoft.EntityFrameworkCore;
using GarageManager.Domain.Entities;
using GarageManager.Infrastructure.Data;

namespace GarageManager.Infrastructure.Repositories;

public class WorkshopRepository
{
    private readonly GarageManagerDbContext _context;

    public WorkshopRepository(GarageManagerDbContext context)
    {
        _context = context;
    }

    public async Task<Workshop> AddAsync(Workshop workshop)
    {
        await _context.Workshops.AddAsync(workshop);

        await _context.SaveChangesAsync();

        return workshop;
    }

    public async Task<Workshop?> GetByIdAsync(Guid id)
    {
        return await _context.Workshops
            .FirstOrDefaultAsync(w => w.Id == id);
    }

    public async Task<List<Workshop>> ListAsync()
    {
        return await _context.Workshops
            .ToListAsync();
    }

    public async Task UpdateAsync(Workshop workshop)
    {
        _context.Workshops.Update(workshop);

        await _context.SaveChangesAsync();
    }

    public async Task RemoveAsync(Workshop workshop)
    {
        _context.Workshops.Remove(workshop);

        await _context.SaveChangesAsync();
    }
}
