using GarageManager.Api.Authorization;
using GarageManager.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GarageManager.Api.Controllers;

/// <summary>
/// Who is signed in. Separate from UserController because [Authorize] on an action adds
/// to the controller's policy rather than replacing it — this has to be reachable by a
/// Mechanic, so it cannot live under a Proprietor-only controller.
/// </summary>
[ApiController]
[Route("api/session")]
[Authorize(Policy = Policies.WorkshopStaff)]
public class SessionController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;

    public SessionController(UserManager<ApplicationUser> users)
    {
        _users = users;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> Me()
    {
        var user = await _users.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        var roles = await _users.GetRolesAsync(user);

        return Ok(new UserResponse(
            user.Id,
            user.Email ?? string.Empty,
            user.DisplayName,
            roles.FirstOrDefault() ?? string.Empty,
            user.MechanicId));
    }
}
