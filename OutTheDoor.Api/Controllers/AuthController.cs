using MediatR;
using Microsoft.AspNetCore.Mvc;
using OutTheDoor.Api.Services.Handlers;
using OutTheDoor.Api.Services.Models;

namespace OutTheDoor.Api.Controllers;

public class AuthController : ApiControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
            return BadRequest(new { error = "Username is required." });

        var user = await _mediator.Send(new LoginCommand(request.Username));
        return Ok(user);
    }
}
