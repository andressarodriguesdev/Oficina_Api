using Microsoft.EntityFrameworkCore;

using OficinaMecanica.Domain.Entities;

using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Infrastructure.Repositories;

public class VeiculoRepository

{

    private readonly OficinaDbContext _context;

    public VeiculoRepository(OficinaDbContext context)

    {

        _context = context;

    }

    public async Task<Veiculo> AdicionarAsync(Veiculo veiculo)

    {

        _context.Veiculos.Add(veiculo);

        await _context.SaveChangesAsync();

        return veiculo;

    }

    public async Task<List<Veiculo>> ListarAsync()

    {

        return await _context.Veiculos

        .Include(v => v.Cliente)

        .ToListAsync();

    }

    public async Task<Veiculo?> ObterPorIdAsync(Guid id)

    {

        return await _context.Veiculos

        .Include(v => v.Cliente)

        .Include(v => v.OrdensServico)

        .FirstOrDefaultAsync(v => v.Id == id);

    }

    public async Task AtualizarAsync(Veiculo veiculo)

    {

        _context.Veiculos.Update(veiculo);

        await _context.SaveChangesAsync();

    }

    public async Task RemoverAsync(Veiculo veiculo)

    {

        _context.Veiculos.Remove(veiculo);

        await _context.SaveChangesAsync();

    }

}