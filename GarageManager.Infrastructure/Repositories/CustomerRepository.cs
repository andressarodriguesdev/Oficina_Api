using Microsoft.EntityFrameworkCore;
using GarageManager.Domain.Entities;
using GarageManager.Infrastructure.Data;

namespace GarageManager.Infrastructure.Repositories;

public class CustomerRepository
{
    private readonly GarageManagerDbContext _context;

    public CustomerRepository(GarageManagerDbContext context)
    {
        _context = context;
    }

    public async Task<Customer> AddAsync(Customer customer)
    {
        _context.Customers.Add(customer);

        await _context.SaveChangesAsync();

        return customer;
    }

    public async Task<List<Customer>> ListAsync()
    {
        return await _context.Customers
            .Include(c => c.Vehicles)
            .ToListAsync();
    }

    public async Task<Customer?> GetByIdAsync(Guid id)
    {
        return await _context.Customers
            .Include(c => c.Vehicles)
            .Include(c => c.JobCards)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task UpdateAsync(Customer customer)
    {
        _context.Customers.Update(customer);

        await _context.SaveChangesAsync();
    }

    public async Task<List<Customer>> ListActiveAsync()
    {
        return await _context.Customers
            .Where(c => c.IsActive)
            .Include(c => c.Vehicles.Where(v => v.IsActive))
            .ToListAsync();
    }
}
