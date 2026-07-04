using Microsoft.AspNetCore.Mvc;

namespace OutTheDoor.Api.Controllers;

public class HealthController : ApiControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { ok = true, at = DateTime.UtcNow });
}
