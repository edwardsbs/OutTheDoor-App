using MediatR;
using Microsoft.EntityFrameworkCore;
using OutTheDoor.Api.Domain;
using OutTheDoor.Api.Services.Models;

namespace OutTheDoor.Api.Services.Handlers;

public record GetScenariosByUserQuery(Guid UserId) : IRequest<IReadOnlyList<ScenarioDto>>;

public class GetScenariosByUserHandler
    : IRequestHandler<GetScenariosByUserQuery, IReadOnlyList<ScenarioDto>>
{
    private readonly IOutTheDoorContext _context;

    public GetScenariosByUserHandler(IOutTheDoorContext context) => _context = context;

    public async Task<IReadOnlyList<ScenarioDto>> Handle(
        GetScenariosByUserQuery request, CancellationToken cancellationToken)
    {
        // Eager-load tasks in a single query to avoid N+1.
        var scenarios = await _context.Scenarios
            .AsNoTracking()
            .Include(s => s.Tasks)
            .Where(s => s.UserId == request.UserId)
            .OrderBy(s => s.Name)
            .ToListAsync(cancellationToken);

        return scenarios.Select(s => s.ToDto()).ToList();
    }
}
