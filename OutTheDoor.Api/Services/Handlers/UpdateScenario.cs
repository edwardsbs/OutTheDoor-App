using MediatR;
using Microsoft.EntityFrameworkCore;
using OutTheDoor.Api.Domain;
using OutTheDoor.Api.Services.Models;

namespace OutTheDoor.Api.Services.Handlers;

public record UpdateScenarioCommand(Guid UserId, Guid Id, ScenarioDto Scenario)
    : IRequest<ScenarioDto?>;

public class UpdateScenarioHandler : IRequestHandler<UpdateScenarioCommand, ScenarioDto?>
{
    private readonly IOutTheDoorContext _context;

    public UpdateScenarioHandler(IOutTheDoorContext context) => _context = context;

    public async Task<ScenarioDto?> Handle(
        UpdateScenarioCommand request, CancellationToken cancellationToken)
    {
        var scenario = await _context.Scenarios
            .Include(s => s.Tasks)
            .FirstOrDefaultAsync(
                s => s.Id == request.Id && s.UserId == request.UserId,
                cancellationToken);

        if (scenario is null) return null;

        var dto = request.Scenario;
        scenario.Name = dto.Name;
        scenario.DefaultLeaveTime = dto.DefaultLeaveTime;
        scenario.BufferMinutes = dto.BufferMinutes;
        scenario.AutoStart = dto.AutoStart;
        scenario.AlertMinutes = dto.AlertMinutes;
        scenario.UpdatedAt = DateTime.UtcNow;

        // Replace the task set wholesale — simplest correct approach for a small
        // nested collection edited as a unit in the UI. Add the new tasks
        // explicitly via the context so they are tracked as Added (not Modified).
        _context.ScenarioTasks.RemoveRange(scenario.Tasks);
        scenario.Tasks.Clear();

        var newTasks = dto.Tasks.Select(t => t.ToEntity(scenario.Id)).ToList();
        _context.ScenarioTasks.AddRange(newTasks);

        await _context.SaveChangesAsync(cancellationToken);

        scenario.Tasks = newTasks;
        return scenario.ToDto();
    }
}
