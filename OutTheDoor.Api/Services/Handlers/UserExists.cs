using MediatR;
using Microsoft.EntityFrameworkCore;
using OutTheDoor.Api.Domain;

namespace OutTheDoor.Api.Services.Handlers;

public record UserExistsQuery(Guid UserId) : IRequest<bool>;

public class UserExistsHandler : IRequestHandler<UserExistsQuery, bool>
{
    private readonly IOutTheDoorContext _context;

    public UserExistsHandler(IOutTheDoorContext context) => _context = context;

    public Task<bool> Handle(UserExistsQuery request, CancellationToken cancellationToken) =>
        _context.Users.AsNoTracking().AnyAsync(u => u.Id == request.UserId, cancellationToken);
}
