using Microsoft.EntityFrameworkCore;
using OutTheDoor.Api.Domain.Entities;

namespace OutTheDoor.Api.Domain;

public class OutTheDoorContext : DbContext, IOutTheDoorContext
{
    public OutTheDoorContext(DbContextOptions<OutTheDoorContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Scenario> Scenarios => Set<Scenario>();
    public DbSet<ScenarioTask> ScenarioTasks => Set<ScenarioTask>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("outthedoor");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OutTheDoorContext).Assembly);
    }
}
