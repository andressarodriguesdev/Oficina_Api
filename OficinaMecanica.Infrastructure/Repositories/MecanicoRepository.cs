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
        var mecanicos = await _context.Mecanicos
            .Where(m => m.OficinaId == oficinaId)
            .Include(m => m.Oficina)
            .AsNoTracking()
            .ToListAsync();

        var ids = mecanicos.Select(m => m.Id).ToList();

        var acessos = await _context.Usuario
            .AsNoTracking()
            .Where(u => u.MecanicoId != null && ids.Contains(u.MecanicoId.Value))
            .Select(u => new { MecanicoId = u.MecanicoId!.Value, u.Email })
            .ToListAsync();

        foreach (var m in mecanicos)
        {
            m.EmailAcesso = acessos
                .FirstOrDefault(a => a.MecanicoId == m.Id)?.Email;
        }

        return mecanicos;
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

    public async Task<Usuario?> ObterUsuarioAsync(int usuarioId)
    {
        return await _context.Usuario
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == usuarioId);
    }

    public async Task AdicionarUsuarioAsync(Usuario usuario)
    {
        await _context.Usuario.AddAsync(usuario);
    }

    public async Task<Mecanico?> ObterSimplesAsync(Guid id)
    {
        return await _context.Mecanicos
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<Usuario?> ObterUsuarioPorEmailParaAtualizacaoAsync(string email)
    {
        return await _context.Usuario
            .Include(u => u.Oficinas)
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<bool> MecanicoJaVinculadoAsync(Guid mecanicoId)
    {
        return await _context.Usuario
            .AnyAsync(u => u.MecanicoId == mecanicoId);
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