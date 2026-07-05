using MediatR;
using Microsoft.AspNetCore.Mvc;
using OutTheDoor.Api.Services.Handlers;
using OutTheDoor.Api.Services.Models;

namespace OutTheDoor.Api.Controllers;

public class ScenariosController : ApiControllerBase
{
    private readonly IMediator _mediator;

    public ScenariosController(IMediator mediator) => _mediator = mediator;

    // Resolves the current user from X-User-Id AND verifies the user still exists.
    // Returns null (-> 401) if the header is missing/invalid or the user is unknown
    // (e.g. a stale session pointing at a database the user was never created in).
    private async Task<Guid?> ResolveUserAsync()
    {
        if (CurrentUserId() is not { } userId) return null;
        return await _mediator.Send(new UserExistsQuery(userId)) ? userId : null;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ScenarioDto>>> GetAll()
    {
        if (await ResolveUserAsync() is not { } userId) return Unauthorized();

        var scenarios = await _mediator.Send(new GetScenariosByUserQuery(userId));
        return Ok(scenarios);
    }

    [HttpPost]
    public async Task<ActionResult<ScenarioDto>> Create([FromBody] ScenarioDto scenario)
    {
        if (await ResolveUserAsync() is not { } userId) return Unauthorized();

        var created = await _mediator.Send(new CreateScenarioCommand(userId, scenario));
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ScenarioDto>> Update(Guid id, [FromBody] ScenarioDto scenario)
    {
        if (await ResolveUserAsync() is not { } userId) return Unauthorized();

        var updated = await _mediator.Send(new UpdateScenarioCommand(userId, id, scenario));
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (await ResolveUserAsync() is not { } userId) return Unauthorized();

        var deleted = await _mediator.Send(new DeleteScenarioCommand(userId, id));
        return deleted ? NoContent() : NotFound();
    }
}
