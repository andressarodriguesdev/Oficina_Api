using OficinaMecanica.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace OficinaMecanica.Infrastructure.Data; 
public class OficinaDbContext : DbContext 
{ 
    public OficinaDbContext(DbContextOptions<OficinaDbContext> options) 
        : base(options) 
    {
    }
    public DbSet<Oficina> Oficinas { get; set; } 
    public DbSet<Cliente> Clientes { get; set; } 
    public DbSet<Veiculo> Veiculos { get; set; } 
    public DbSet<OrdemServico> OrdensServico { get; set; }
    public DbSet<HistoricoOrdemServico> HistoricosOrdemServico { get; set; }
    public DbSet<OrdemServicoItem> OrdemServicoItens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        
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
    }
}