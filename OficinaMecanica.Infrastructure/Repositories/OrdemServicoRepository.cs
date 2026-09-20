
using Microsoft.EntityFrameworkCore;

using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Domain.Enums;

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

        return await ObterPorIdAsync(ordemServico.Id)
            ?? throw new Exception("Não foi possível recuperar a ordem de serviço criada.");
    }

    public async Task<List<OrdemServico>> ListarAsync()
    {
        return await _context.OrdensServico

            .Include(o => o.Cliente)
                .ThenInclude(c => c.Oficina)

            .Include(o => o.Veiculo)

            .Include(o => o.Itens)

            .Include(o => o.Historicos)

            .Include(o => o.Mecanico)

            .ToListAsync();
    }


    public async Task<OrdemServico?> ObterPorIdAsync(Guid id)
    {
        return await _context.OrdensServico

            .Include(o => o.Cliente)
                .ThenInclude(c => c.Oficina)

            .Include(o => o.Veiculo)

            .Include(o => o.Itens)

            .Include(o => o.Historicos)

            .Include(o => o.Mecanico)

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



    public async Task AdicionarItemAsync(OrdemServico ordem, OrdemServicoItem item)
    {
        ordem.AdicionarItem(item);

        _context.Entry(item).State = EntityState.Added; // força o EF a tratar como INSERT

        await _context.SaveChangesAsync();
    }

    public async Task SalvarAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<List<OrdemServico>> ListarFinanceiroAsync()
    {
        return await _context.OrdensServico
            .Include(o => o.Cliente)
            .Include(o => o.Veiculo)
            .Include(o => o.Mecanico)
            .Include(o => o.Itens)
            .ToListAsync();
    }


    public async Task<int> ObterQuantidadeReservadaAsync(
        Guid pecaId,
        Guid? excluirOrdemId = null)
    {
        var statusAtivos = new[]
        {
            StatusOrdemServico.Aberta,
            StatusOrdemServico.AguardandoAprovacao,
            StatusOrdemServico.Aprovada,
            StatusOrdemServico.Reaberta
        };

        var query = _context.OrdensServico
            .AsNoTracking()
            .Where(o => statusAtivos.Contains(o.Status));

        if (excluirOrdemId.HasValue)
        {
            query = query.Where(o => o.Id != excluirOrdemId.Value);
        }

        return await query
            .SelectMany(o => o.Itens)
            .Where(i => i.PecaId == pecaId)
            .SumAsync(i => i.Quantidade);
    }

    public async Task<List<(Guid OrdemId, int Quantidade)>>
        ObterReservasPorOrdemAsync(
            Guid pecaId,
            Guid? excluirOrdemId = null)
    {
        var statusAtivos = new[]
        {
        StatusOrdemServico.Aberta,
        StatusOrdemServico.AguardandoAprovacao,
        StatusOrdemServico.Aprovada,
        StatusOrdemServico.Reaberta
    };

        var query = _context.OrdensServico
            .AsNoTracking()
            .Where(o => statusAtivos.Contains(o.Status));

        if (excluirOrdemId.HasValue)
        {
            query = query.Where(o => o.Id != excluirOrdemId.Value);
        }

        var reservas = await query
            .SelectMany(o => o.Itens
                .Where(i => i.PecaId == pecaId)
                .Select(i => new
                {
                    OrdemId = o.Id,
                    Quantidade = i.Quantidade
                }))
            .GroupBy(x => x.OrdemId)
            .Select(g => new
            {
                OrdemId = g.Key,
                Quantidade = g.Sum(x => x.Quantidade)
            })
            .ToListAsync();

        return reservas
            .Select(x => (x.OrdemId, x.Quantidade))
            .ToList();
    }
}

