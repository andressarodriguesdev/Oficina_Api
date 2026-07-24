using System;
using System.Collections.Generic;
using System.Text;

using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Infrastructure.Repositories;

public class OficinaRepository
{
    private readonly OficinaDbContext _context;

    public OficinaRepository(OficinaDbContext context)
    {
        _context = context;
    }


    public async Task<Oficina> AdicionarAsync(Oficina oficina)
    {
        await _context.Oficinas.AddAsync(oficina);

        await _context.SaveChangesAsync();

        return oficina;
    }


    public async Task<Oficina?> ObterPorIdAsync(Guid id)
    {
        return await _context.Oficinas
            .FirstOrDefaultAsync(o => o.Id == id);
    }


    public async Task<List<Oficina>> ListarAsync()
    {
        return await _context.Oficinas
            .ToListAsync();
    }


    public async Task AtualizarAsync(Oficina oficina)
    {
        _context.Oficinas.Update(oficina);

        await _context.SaveChangesAsync();
    }


    public async Task RemoverAsync(Oficina oficina)
    {
        _context.Oficinas.Remove(oficina);

        await _context.SaveChangesAsync();
    }
}