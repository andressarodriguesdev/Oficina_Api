using Microsoft.EntityFrameworkCore;

using OficinaMecanica.Domain.Entities;

using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Infrastructure.Repositories;

public class OrdemServicoRepository

{

    private readonly OficinaDbContext _context;

    public OrdemServicoRepository(OficinaDbContext context)

    {

        _context = context;

    }

    public async Task<OrdemServico> AdicionarAsync(OrdemServico ordemServico)

    {

        _context.OrdensServico.Add(ordemServico);

        await _context.SaveChangesAsync();

        return ordemServico;

    }

    public async Task<List<OrdemServico>> ListarAsync()

    {

        return await _context.OrdensServico

        .Include(o => o.Cliente)

        .Include(o => o.Veiculo)

        .ToListAsync();

    }

    public async Task<OrdemServico?> ObterPorIdAsync(Guid id)

    {

        return await _context.OrdensServico

        .Include(o => o.Cliente)

        .Include(o => o.Veiculo)

        .FirstOrDefaultAsync(o => o.Id == id);

    }

    public async Task AtualizarAsync(OrdemServico ordemServico)

    {

        _context.OrdensServico.Update(ordemServico);

        await _context.SaveChangesAsync();

    }

    public async Task RemoverAsync(OrdemServico ordemServico)

    {

        _context.OrdensServico.Remove(ordemServico);

        await _context.SaveChangesAsync();

    }

}