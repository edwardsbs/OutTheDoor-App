using MediatR;
using OutTheDoor.Api.Domain.Entities;
using OutTheDoor.Api.Domain;
using OutTheDoor.Api.Services.Models;

namespace OutTheDoor.Api.Services.Handlers;

public record CreateScenarioCommand(Guid UserId, ScenarioDto Scenario) : IRequest<ScenarioDto>;

public class CreateScenarioHandler : IRequestHandler<CreateScenarioCommand, ScenarioDto>
{
    private readonly IOutTheDoorContext _context;

    public CreateScenarioHandler(IOutTheDoorContext context) => _context = context;

    public async Task<ScenarioDto> Handle(
        CreateScenarioCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Scenario;
        var now = DateTime.UtcNow;

        var scenario = new Scenario
        {
            Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
            UserId = request.UserId,
            Name = dto.Name,
            DefaultLeaveTime = dto.DefaultLeaveTime,
            BufferMinutes = dto.BufferMinutes,
            AutoStart = dto.AutoStart,
            AlertMinutes = dto.AlertMinutes,
            CreatedAt = now,
            UpdatedAt = now
        };

        scenario.Tasks = dto.Tasks.Select(t => t.ToEntity(scenario.Id)).ToList();

        _context.Scenarios.Add(scenario);
        await _context.SaveChangesAsync(cancellationToken);

        return scenario.ToDto();
    }
}
