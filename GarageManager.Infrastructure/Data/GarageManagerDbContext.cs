using GarageManager.Domain.Entities;
using GarageManager.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GarageManager.Infrastructure.Data;

public class GarageManagerDbContext
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public GarageManagerDbContext(DbContextOptions<GarageManagerDbContext> options)
        : base(options)
    {
    }

    public DbSet<Workshop> Workshops { get; set; }
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<JobCard> JobCards { get; set; }
    public DbSet<JobCardStatusChange> JobCardStatusChanges { get; set; }
    public DbSet<Part> Parts { get; set; }
    public DbSet<Mechanic> Mechanics { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Workshop>()
            .HasMany<Customer>()
            .WithOne(c => c.Workshop)
            .HasForeignKey(c => c.WorkshopId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Workshop>()
            .HasMany<Vehicle>()
            .WithOne(v => v.Workshop)
            .HasForeignKey(v => v.WorkshopId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Workshop>()
            .HasMany<JobCard>()
            .WithOne(j => j.Workshop)
            .HasForeignKey(j => j.WorkshopId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Vehicles)
            .WithOne(v => v.Customer)
            .HasForeignKey(v => v.CustomerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Customer>()
            .HasMany(c => c.JobCards)
            .WithOne(j => j.Customer)
            .HasForeignKey(j => j.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Vehicle>()
            .HasMany(v => v.JobCards)
            .WithOne(j => j.Vehicle)
            .HasForeignKey(j => j.VehicleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<JobCard>()
            .Property(j => j.LabourCharge)
            .HasPrecision(18, 2);

        modelBuilder.Entity<JobCard>()
            .HasMany(j => j.StatusChanges)
            .WithOne(h => h.JobCard)
            .HasForeignKey(h => h.JobCardId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<JobCard>()
            .HasMany(j => j.Parts)
            .WithOne(p => p.JobCard)
            .HasForeignKey(p => p.JobCardId);

        // A User may be a Mechanic, and a Mechanic may have at most one sign-in.
        // Restrict, not cascade: deactivating a Mechanic must not delete the account.
        modelBuilder.Entity<ApplicationUser>()
            .HasOne<Mechanic>()
            .WithMany()
            .HasForeignKey(u => u.MechanicId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ApplicationUser>()
            .HasIndex(u => u.MechanicId)
            .IsUnique();
    }
}
