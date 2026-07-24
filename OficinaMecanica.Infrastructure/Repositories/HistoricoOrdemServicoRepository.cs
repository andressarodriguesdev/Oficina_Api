using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Infrastructure.Repositories;

public class HistoricoOrdemServicoRepository
{
    private readonly OficinaDbContext _context;

    public HistoricoOrdemServicoRepository(OficinaDbContext context)
    {
        _context = context;
    }


    public async Task<HistoricoOrdemServico> AdicionarAsync(
        HistoricoOrdemServico historico)
    {
        _context.HistoricosOrdemServico.Add(historico);

        await _context.SaveChangesAsync();

        return historico;
    }


    public async Task<List<HistoricoOrdemServico>>
        ObterPorOrdemServicoIdAsync(Guid ordemServicoId)
    {
        return await _context.HistoricosOrdemServico
            .Where(h => h.OrdemServicoId == ordemServicoId)
            .OrderBy(h => h.DataAlteracao)
            .ToListAsync();
    }
}