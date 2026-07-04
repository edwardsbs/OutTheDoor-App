using Microsoft.EntityFrameworkCore;
using OutTheDoor.Api.Domain.Entities;

namespace OutTheDoor.Api.Domain;

public interface IOutTheDoorContext
{
    DbSet<User> Users { get; }
    DbSet<Scenario> Scenarios { get; }
    DbSet<ScenarioTask> ScenarioTasks { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
