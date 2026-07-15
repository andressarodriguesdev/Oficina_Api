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


    public async Task<List<Cliente>> ListarAsync()
    {
        return await _context.Clientes
            .Include(c => c.Veiculos)
            .ToListAsync();
    }

    public async Task<Cliente?> ObterPorIdAsync(Guid id)
    {
        return await _context.Clientes
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
}