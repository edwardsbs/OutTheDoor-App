using MediatR;
using Microsoft.AspNetCore.Mvc;
using OutTheDoor.Api.Services.Handlers;
using OutTheDoor.Api.Services.Models;

namespace OutTheDoor.Api.Controllers;

public class ScenariosController : ApiControllerBase
{
    private readonly IMediator _mediator;

    public ScenariosController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ScenarioDto>>> GetAll()
    {
        if (CurrentUserId() is not { } userId) return Unauthorized();

        var scenarios = await _mediator.Send(new GetScenariosByUserQuery(userId));
        return Ok(scenarios);
    }

    [HttpPost]
    public async Task<ActionResult<ScenarioDto>> Create([FromBody] ScenarioDto scenario)
    {
        if (CurrentUserId() is not { } userId) return Unauthorized();

        var created = await _mediator.Send(new CreateScenarioCommand(userId, scenario));
        return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ScenarioDto>> Update(Guid id, [FromBody] ScenarioDto scenario)
    {
        if (CurrentUserId() is not { } userId) return Unauthorized();

        var updated = await _mediator.Send(new UpdateScenarioCommand(userId, id, scenario));
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (CurrentUserId() is not { } userId) return Unauthorized();

        var deleted = await _mediator.Send(new DeleteScenarioCommand(userId, id));
        return deleted ? NoContent() : NotFound();
    }
}
