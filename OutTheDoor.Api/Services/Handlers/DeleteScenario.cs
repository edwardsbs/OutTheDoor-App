using MediatR;
using Microsoft.EntityFrameworkCore;
using OutTheDoor.Api.Domain;

namespace OutTheDoor.Api.Services.Handlers;

public record DeleteScenarioCommand(Guid UserId, Guid Id) : IRequest<bool>;

public class DeleteScenarioHandler : IRequestHandler<DeleteScenarioCommand, bool>
{
    private readonly IOutTheDoorContext _context;

    public DeleteScenarioHandler(IOutTheDoorContext context) => _context = context;

    public async Task<bool> Handle(
        DeleteScenarioCommand request, CancellationToken cancellationToken)
    {
        var scenario = await _context.Scenarios
            .FirstOrDefaultAsync(
                s => s.Id == request.Id && s.UserId == request.UserId,
                cancellationToken);

        if (scenario is null) return false;

        _context.Scenarios.Remove(scenario);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
