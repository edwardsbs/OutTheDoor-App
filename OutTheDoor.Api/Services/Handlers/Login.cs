using MediatR;
using Microsoft.EntityFrameworkCore;
using OutTheDoor.Api.Domain;
using OutTheDoor.Api.Domain.Entities;
using OutTheDoor.Api.Services.Models;

namespace OutTheDoor.Api.Services.Handlers;

public record LoginCommand(string Username) : IRequest<UserDto>;

public class LoginHandler : IRequestHandler<LoginCommand, UserDto>
{
    private readonly IOutTheDoorContext _context;

    public LoginHandler(IOutTheDoorContext context) => _context = context;

    public async Task<UserDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var username = request.Username.Trim();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == username, cancellationToken);

        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                CreatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return new UserDto(user.Id, user.Username);
    }
}
