using OficinaMecanica.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace OficinaMecanica.Infrastructure.Data; 
public class OficinaDbContext : DbContext 
{ 
    private readonly IUsuarioAtualProvider? _usuarioAtual;

    public OficinaDbContext(
        DbContextOptions<OficinaDbContext> options,
        IUsuarioAtualProvider? usuarioAtual = null) 
        : base(options) 
    {
        _usuarioAtual = usuarioAtual;
    }
    public DbSet<Usuario> Usuario { get; set; }
    public DbSet<Oficina> Oficinas { get; set; } 
    public DbSet<Cliente> Clientes { get; set; } 
    public DbSet<Veiculo> Veiculos { get; set; } 
    public DbSet<OrdemServico> OrdensServico { get; set; }
    public DbSet<HistoricoOrdemServico> HistoricosOrdemServico { get; set; }
    public DbSet<OrdemServicoItem> OrdemServicoItens { get; set; }

    public DbSet<Mecanico> Mecanicos { get; set; }
    public DbSet<Pecas> Pecas { get; set; }
    public DbSet<MovimentacaoEstoque> MovimentacoesEstoque { get; set; }
    public DbSet<LogAuditoria> LogsAuditoria { get; set; }

    // =====================================================
    // AUDITORIA DE CADASTROS (clientes, veículos, peças, mecânicos)
    // =====================================================

    private static readonly Dictionary<Type, string> _entidadesAuditadas = new()
    {
        [typeof(Cliente)] = "Cliente",
        [typeof(Veiculo)] = "Veículo",
        [typeof(Pecas)] = "Peça",
        [typeof(Mecanico)] = "Mecânico"
    };

    private List<LogAuditoria> MontarAuditoria(int usuarioId, string? usuarioNome)
    {
        ChangeTracker.DetectChanges();

        var logs = new List<LogAuditoria>();

        foreach (var entry in ChangeTracker.Entries().ToList())
        {
            if (!_entidadesAuditadas.TryGetValue(entry.Entity.GetType(), out var nomeEntidade))
                continue;

            string acao;

            if (entry.State == EntityState.Added)
                acao = "Criado";
            else if (entry.State == EntityState.Deleted)
                acao = "Excluído";
            else if (entry.State == EntityState.Modified)
            {
                acao = "Alterado";

                var ativo = entry.Metadata.FindProperty("Ativo");

                if (ativo != null && entry.Property("Ativo").IsModified)
                    acao = entry.Property("Ativo").CurrentValue is true ? "Reativado" : "Inativado";
            }
            else
                continue;

            var tipo = entry.Entity.GetType();

            var descricao =
                tipo.GetProperty("Nome")?.GetValue(entry.Entity) as string ??
                tipo.GetProperty("Placa")?.GetValue(entry.Entity) as string;

            logs.Add(new LogAuditoria
            {
                OficinaId = tipo.GetProperty("OficinaId")?.GetValue(entry.Entity) as Guid?,
                UsuarioId = usuarioId,
                UsuarioNome = usuarioNome,
                Acao = acao,
                Entidade = nomeEntidade,
                EntidadeId = entry.Property("Id").CurrentValue is Guid id ? id : Guid.Empty,
                Descricao = descricao,
                CriadoEm = DateTime.UtcNow
            });
        }

        return logs;
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        var usuarioId = _usuarioAtual?.ObterUsuarioId();

        if (usuarioId.HasValue)
        {
            var nome = Usuario.AsNoTracking()
                .Where(u => u.Id == usuarioId.Value)
                .Select(u => u.Nome)
                .FirstOrDefault();

            LogsAuditoria.AddRange(MontarAuditoria(usuarioId.Value, nome));
        }

        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    public override async Task<int> SaveChangesAsync(
        bool acceptAllChangesOnSuccess,
        CancellationToken cancellationToken = default)
    {
        var usuarioId = _usuarioAtual?.ObterUsuarioId();

        if (usuarioId.HasValue)
        {
            var nome = await Usuario.AsNoTracking()
                .Where(u => u.Id == usuarioId.Value)
                .Select(u => u.Nome)
                .FirstOrDefaultAsync(cancellationToken);

            await LogsAuditoria.AddRangeAsync(
                MontarAuditoria(usuarioId.Value, nome),
                cancellationToken);
        }

        return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        


        
// Usuario

        modelBuilder.Entity<Usuario>()
            .Property(u => u.Nome)
            .IsRequired()
            .HasMaxLength(150);

        modelBuilder.Entity<Usuario>()
            .Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(150);

        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Usuario>()
            .Property(u => u.SenhaHash)
            .IsRequired();

        modelBuilder.Entity<Usuario>()
            .Property(u => u.DataCadastro)
            .IsRequired();

        modelBuilder.Entity<LogAuditoria>()
            .HasIndex(l => new { l.Entidade, l.EntidadeId });

        modelBuilder.Entity<Usuario>()
            .Property(u => u.Ativo)
            .IsRequired();

        modelBuilder.Entity<Usuario>()
            .Property(u => u.Perfil)
            .HasConversion<int>()
            .IsRequired();

        // Usuario -> Mecanico (um login por mecânico)
        modelBuilder.Entity<Usuario>()
            .HasOne<Mecanico>()
            .WithMany()
            .HasForeignKey(u => u.MecanicoId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.MecanicoId)
            .IsUnique()
            .HasFilter("\"MecanicoId\" IS NOT NULL");


        // Usuario -> Oficinas
        modelBuilder.Entity<Usuario>()
            .HasMany(u => u.Oficinas)
            .WithOne()
            .HasForeignKey(o => o.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        // Oficina -> Clientes

        modelBuilder.Entity<Oficina>()
            .HasMany<Cliente>()
            .WithOne(c => c.Oficina)
            .HasForeignKey(c => c.OficinaId) 
            .OnDelete(DeleteBehavior.Restrict); 
        
        // Oficina -> Veiculos
        modelBuilder.Entity<Oficina>()
            .HasMany<Veiculo>()
            .WithOne(v => v.Oficina) 
            .HasForeignKey(v => v.OficinaId) 
            .OnDelete(DeleteBehavior.Restrict);
        
        // Oficina -> OrdensServico
        modelBuilder.Entity<Oficina>() 
            .HasMany<OrdemServico>() 
            .WithOne(o => o.Oficina) 
            .HasForeignKey(o => o.OficinaId)
            .OnDelete(DeleteBehavior.Restrict); 
        
        // Cliente -> Veiculos
        modelBuilder.Entity<Cliente>() 
            .HasMany(c => c.Veiculos) 
            .WithOne(v => v.Cliente) 
            .HasForeignKey(v => v.ClienteId) 
            .OnDelete(DeleteBehavior.Cascade); 
        
        // Cliente -> OrdensServico
        modelBuilder.Entity<Cliente>() 
            .HasMany(c => c.OrdensServico)
            .WithOne(os => os.Cliente) 
            .HasForeignKey(os => os.ClienteId)
            .OnDelete(DeleteBehavior.Restrict); 
        
        // Veiculo -> OrdensServico
        modelBuilder.Entity<Veiculo>() 
            .HasMany(v => v.OrdensServico) 
            .WithOne(os => os.Veiculo)
            .HasForeignKey(os => os.VeiculoId) 
            .OnDelete(DeleteBehavior.Restrict);

        // Valor monetário
        modelBuilder.Entity<OrdemServico>()
        .Property(x => x.ValorMaoObra)
        .HasPrecision(18, 2);

        // HistoricoOrdemServico -> OrdemServico
        modelBuilder.Entity<OrdemServico>()
            .HasMany(o => o.Historicos) 
            .WithOne(h => h.OrdemServico)
            .HasForeignKey(h => h.OrdemServicoId)
            .OnDelete(DeleteBehavior.Restrict);

        // OrdemServicoItem -> OrdemServico
        modelBuilder.Entity<OrdemServico>()
            .HasMany(o => o.Itens)
            .WithOne(i => i.OrdemServico)
            .HasForeignKey(i => i.OrdemServicoId);

        // OrdemServicoItem -> Pecas
        modelBuilder.Entity<Pecas>()
            .HasMany<OrdemServicoItem>()
            .WithOne(i => i.Peca)
            .HasForeignKey(i => i.PecaId)
            .OnDelete(DeleteBehavior.Restrict);

        // Oficina -> Pecas
        modelBuilder.Entity<Oficina>()
            .HasMany<Pecas>()
            .WithOne(p => p.Oficina)
            .HasForeignKey(p => p.OficinaId)
            .OnDelete(DeleteBehavior.Restrict);

        // MovimentacaoEstoque -> Pecas
        // Cascade: só peças nunca usadas em OS podem ser excluídas,
        // então o histórico delas é removido junto.
        modelBuilder.Entity<MovimentacaoEstoque>()
            .HasOne(m => m.Peca)
            .WithMany()
            .HasForeignKey(m => m.PecaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<MovimentacaoEstoque>()
            .Property(m => m.Motivo)
            .HasMaxLength(300);

        modelBuilder.Entity<MovimentacaoEstoque>()
            .HasIndex(m => new { m.PecaId, m.CriadoEm });
    }
}