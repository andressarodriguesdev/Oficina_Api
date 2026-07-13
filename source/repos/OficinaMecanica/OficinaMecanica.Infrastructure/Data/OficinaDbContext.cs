using OficinaMecanica.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace OficinaMecanica.Infrastructure.Data;

public class OficinaDbContext : DbContext
{
    public OficinaDbContext(DbContextOptions<OficinaDbContext> options)
        : base(options)
    {
    }


    public DbSet<Cliente> Clientes { get; set; }

    public DbSet<Veiculo> Veiculos { get; set; }

    public DbSet<OrdemServico> OrdensServico { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // Cliente
        modelBuilder.Entity<Cliente>()
            .HasMany(c => c.Veiculos)
            .WithOne(v => v.Cliente)
            .HasForeignKey(v => v.ClienteId)
            .OnDelete(DeleteBehavior.Cascade);


        // Cliente -> OrdemServico
        modelBuilder.Entity<Cliente>()
            .HasMany(c => c.OrdensServico)
            .WithOne(os => os.Cliente)
            .HasForeignKey(os => os.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);


        // Veiculo -> OrdemServico
        modelBuilder.Entity<Veiculo>()
            .HasMany(v => v.OrdensServico)
            .WithOne(os => os.Veiculo)
            .HasForeignKey(os => os.VeiculoId)
            .OnDelete(DeleteBehavior.Restrict);


        // Valor monetário
        modelBuilder.Entity<OrdemServico>()
            .Property(x => x.Valor)
            .HasPrecision(18, 2);
    }
}