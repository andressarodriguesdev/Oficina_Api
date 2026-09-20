using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Infrastructure.Repositories;

public class PecasRepository
{
    private readonly OficinaDbContext _context;

    public PecasRepository(OficinaDbContext context)
    {
        _context = context;
    }

    public async Task<List<Pecas>> GetAllAsync(Guid oficinaId)
    {
        return await _context.Pecas
            .Where(p => p.OficinaId == oficinaId)
            .Include(p => p.Oficina)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Pecas?> GetByIdAsync(
        Guid id,
        Guid oficinaId)
    {
        return await _context.Pecas
            .Where(p => p.OficinaId == oficinaId)
            .Include(p => p.Oficina)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<bool> FoiUtilizadaEmOrdemServicoAsync(Guid pecaId)
    {
        return await _context.OrdemServicoItens
            .AnyAsync(i => i.PecaId == pecaId);
    }

    public async Task<int> ObterQuantidadeUtilizadaEmOrdensServicoAsync(
        Guid pecaId)
    {
        return await _context.OrdemServicoItens
            .Where(i => i.PecaId == pecaId)
            .SumAsync(i => i.Quantidade);
    }

    public async Task AddAsync(Pecas peca)
    {
        await _context.Pecas.AddAsync(peca);
    }

    public void Update(Pecas peca)
    {
        _context.Pecas.Update(peca);
    }

    public void Remove(Pecas peca)
    {
        _context.Pecas.Remove(peca);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}