using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Infrastructure.Repositories;

public class MovimentacaoEstoqueRepository
{
    private readonly OficinaDbContext _context;

    public MovimentacaoEstoqueRepository(OficinaDbContext context)
    {
        _context = context;
    }

    // Apenas registra a movimentação no contexto.
    // Ela é gravada no mesmo SaveChanges da peça/OS que a originou,
    // garantindo que estoque e histórico sejam salvos juntos.
    public async Task AddAsync(MovimentacaoEstoque movimentacao)
    {
        await _context.MovimentacoesEstoque.AddAsync(movimentacao);
    }

    public async Task<List<MovimentacaoEstoque>> ListarAsync(
        Guid pecaId,
        Guid oficinaId,
        DateTime? de,
        DateTime? ate,
        TipoMovimentacaoEstoque? tipo)
    {
        var query = _context.MovimentacoesEstoque
            .AsNoTracking()
            .Where(m =>
                m.PecaId == pecaId &&
                m.OficinaId == oficinaId);

        // Npgsql exige Kind=Utc para timestamptz.
        if (de.HasValue)
        {
            var inicio = DateTime.SpecifyKind(
                de.Value.Date,
                DateTimeKind.Utc);

            query = query.Where(m => m.CriadoEm >= inicio);
        }

        if (ate.HasValue)
        {
            var fim = DateTime.SpecifyKind(
                ate.Value.Date.AddDays(1),
                DateTimeKind.Utc);

            query = query.Where(m => m.CriadoEm < fim);
        }

        if (tipo.HasValue)
        {
            query = query.Where(m => m.Tipo == tipo.Value);
        }

        return await query
            .OrderByDescending(m => m.CriadoEm)
            .ToListAsync();
    }
}
