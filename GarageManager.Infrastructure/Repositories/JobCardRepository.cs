using Microsoft.EntityFrameworkCore;
using GarageManager.Domain.Entities;
using GarageManager.Infrastructure.Data;

namespace GarageManager.Infrastructure.Repositories;

public class JobCardRepository
{
    private readonly GarageManagerDbContext _context;

    public JobCardRepository(GarageManagerDbContext context)
    {
        _context = context;
    }

    public async Task<JobCard> AddAsync(JobCard jobCard)
    {
        _context.JobCards.Add(jobCard);

        await _context.SaveChangesAsync();

        return jobCard;
    }

    public async Task<List<JobCard>> ListAsync()
    {
        return await _context.JobCards
            .Include(j => j.Customer)
                .ThenInclude(c => c.Workshop)
            .Include(j => j.Vehicle)
            .Include(j => j.Parts)
            .Include(j => j.StatusChanges)
            .Include(j => j.Mechanic)
            .ToListAsync();
    }

    public async Task<JobCard?> GetByIdAsync(Guid id)
    {
        return await _context.JobCards
            .Include(j => j.Customer)
                .ThenInclude(c => c.Workshop)
            .Include(j => j.Vehicle)
            .Include(j => j.Parts)
            .Include(j => j.StatusChanges)
            .Include(j => j.Mechanic)
            .FirstOrDefaultAsync(j => j.Id == id);
    }

    public async Task UpdateAsync(JobCard jobCard)
    {
        _context.JobCards.Update(jobCard);

        await _context.SaveChangesAsync();
    }

    public async Task RemoveAsync(JobCard jobCard)
    {
        _context.JobCards.Remove(jobCard);

        await _context.SaveChangesAsync();
    }

    public async Task AddPartAsync(Part part)
    {
        _context.Parts.Add(part);

        await _context.SaveChangesAsync();
    }

    public async Task<List<JobCard>> ListForFinanceAsync()
    {
        return await _context.JobCards
            .Include(j => j.Customer)
            .Include(j => j.Vehicle)
            .Include(j => j.Parts)
            .Include(j => j.Mechanic)
            .ToListAsync();
    }
}
