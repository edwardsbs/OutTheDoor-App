using Microsoft.AspNetCore.Mvc;

namespace OutTheDoor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected const string UserHeader = "X-User-Id";

    /// <summary>
    /// Resolves the current user id from the X-User-Id header.
    /// Returns null when the header is missing or malformed.
    /// </summary>
    protected Guid? CurrentUserId()
    {
        if (Request.Headers.TryGetValue(UserHeader, out var value)
            && Guid.TryParse(value.ToString(), out var userId))
        {
            return userId;
        }

        return null;
    }
}
