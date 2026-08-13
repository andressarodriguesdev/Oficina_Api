using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Infrastructure.Repositories;

public class ClienteRepository
{
    private readonly OficinaDbContext _context;

    public ClienteRepository(OficinaDbContext context)
    {
        _context = context;
    }

    public async Task<Cliente> AdicionarAsync(Cliente cliente)
    {
        _context.Clientes.Add(cliente);

        await _context.SaveChangesAsync();

        return cliente;
    }

    public async Task<List<Cliente>> ListarAsync(Guid oficinaId)
    {
        return await _context.Clientes
            .Where(c => c.OficinaId == oficinaId)
            .Include(c => c.Veiculos)
            .ToListAsync();
    }

    public async Task<Cliente?> ObterPorIdAsync(
        Guid id,
        Guid oficinaId)
    {
        return await _context.Clientes
            .Where(c => c.OficinaId == oficinaId)
            .Include(c => c.Veiculos)
            .Include(c => c.OrdensServico)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task AtualizarAsync(Cliente cliente)
    {
        _context.Clientes.Update(cliente);

        await _context.SaveChangesAsync();
    }

    public async Task RemoverAsync(Cliente cliente)
    {
        _context.Clientes.Remove(cliente);

        await _context.SaveChangesAsync();
    }

    public async Task<List<Cliente>> ListarAtivosAsync(Guid oficinaId)
    {
        return await _context.Clientes
            .Where(c => c.OficinaId == oficinaId && c.Ativo)
            .Include(c => c.Veiculos.Where(v => v.Ativo))
            .ToListAsync();
    }

    public async Task<Cliente?> BuscarComHistoricoAsync(
        Guid id,
        Guid oficinaId)
    {
        return await _context.Clientes
            .Where(c => c.OficinaId == oficinaId)
            .Include(c => c.OrdensServico)
                .ThenInclude(o => o.Historicos)
            .FirstOrDefaultAsync(c => c.Id == id);
    }
}