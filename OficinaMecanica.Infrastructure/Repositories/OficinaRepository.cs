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

    public async Task<Oficina?> ObterPorUsuarioIdAsync(int usuarioId)
    {
        return await _context.Oficinas
            .FirstOrDefaultAsync(o => o.UsuarioId == usuarioId);
    }

    /// <summary>
    /// Oficina do usuário autenticado: a que ele administra (Admin) ou a do mecânico
    /// vinculado a ele (Mecanico). Nunca depende de ids enviados pelo cliente.
    /// </summary>
    public async Task<Oficina?> ObterParaUsuarioAsync(int usuarioId)
    {
        var usuario = await _context.Usuario
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == usuarioId);

        if (usuario == null || !usuario.Ativo)
            return null;

        if (usuario.Perfil == PerfilAcesso.Admin)
        {
            // O sistema tem uma única oficina: o Admin que a criou continua sendo
            // o "dono", e qualquer outro Admin cadastrado depois pertence a ela.
            var propria = await _context.Oficinas
                .FirstOrDefaultAsync(o => o.UsuarioId == usuario.Id);

            return propria ?? await _context.Oficinas.FirstOrDefaultAsync();
        }

        if (usuario.Perfil == PerfilAcesso.Mecanico && usuario.MecanicoId.HasValue)
        {
            var oficinaId = await _context.Mecanicos
                .Where(m => m.Id == usuario.MecanicoId.Value && m.Ativo)
                .Select(m => (Guid?)m.OficinaId)
                .FirstOrDefaultAsync();

            if (!oficinaId.HasValue)
                return null;

            return await _context.Oficinas
                .FirstOrDefaultAsync(o => o.Id == oficinaId.Value);
        }

        return null;
    }

    // Nova regra: o sistema possui uma única oficina
    public async Task<Oficina?> ObterUnicaAsync()
    {
        return await _context.Oficinas
            .FirstOrDefaultAsync();
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