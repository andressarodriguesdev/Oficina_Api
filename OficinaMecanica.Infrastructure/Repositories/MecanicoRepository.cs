using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Infrastructure.Repositories;

public class MecanicoRepository
{
    private readonly OficinaDbContext _context;

    public MecanicoRepository(OficinaDbContext context)
    {
        _context = context;
    }

    public async Task<List<Mecanico>> GetAllAsync(Guid oficinaId)
    {
        return await _context.Mecanicos
            .Where(m => m.OficinaId == oficinaId)
            .Include(m => m.Oficina)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Mecanico?> GetByIdAsync(
        Guid id,
        Guid oficinaId)
    {
        return await _context.Mecanicos
            .Where(m => m.OficinaId == oficinaId)
            .Include(m => m.OrdensServico)
                .ThenInclude(o => o.Cliente)
            .Include(m => m.OrdensServico)
                .ThenInclude(o => o.Veiculo)
            .Include(m => m.Oficina)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task AddAsync(Mecanico mecanico)
    {
        await _context.Mecanicos.AddAsync(mecanico);
    }

    public void Update(Mecanico mecanico)
    {
        _context.Mecanicos.Update(mecanico);
    }

    public void Delete(Mecanico mecanico)
    {
        _context.Mecanicos.Remove(mecanico);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}