using Microsoft.EntityFrameworkCore;
using GarageManager.Domain.Entities;
using GarageManager.Infrastructure.Data;

namespace GarageManager.Infrastructure.Repositories;

public class JobCardStatusChangeRepository
{
    private readonly GarageManagerDbContext _context;

    public JobCardStatusChangeRepository(GarageManagerDbContext context)
    {
        _context = context;
    }

    public async Task<JobCardStatusChange> AddAsync(
        JobCardStatusChange statusChange)
    {
        _context.JobCardStatusChanges.Add(statusChange);

        await _context.SaveChangesAsync();

        return statusChange;
    }

    public async Task<List<JobCardStatusChange>>
        GetByJobCardIdAsync(Guid jobCardId)
    {
        return await _context.JobCardStatusChanges
            .Where(h => h.JobCardId == jobCardId)
            .OrderBy(h => h.ChangedAt)
            .ToListAsync();
    }
}
