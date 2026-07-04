namespace OutTheDoor.Api.Services.Models;

public record LoginRequest(string Username);

public record UserDto(Guid UserId, string Username);
