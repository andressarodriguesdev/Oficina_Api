using GarageManager.Api.Authorization;
using GarageManager.Domain.Constants;
using GarageManager.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GarageManager.Api.Controllers;

/// <summary>
/// Accounts are handed out by the Proprietor, not signed up for. See docs/adr/0001.
/// </summary>
[ApiController]
[Route("api/users")]
[Authorize(Policy = Policies.ProprietorOnly)]
public class UserController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;

    public UserController(UserManager<ApplicationUser> users)
    {
        _users = users;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserResponse>>> GetAll()
    {
        var users = _users.Users.OrderBy(u => u.DisplayName).ToList();

        var response = new List<UserResponse>(users.Count);
        foreach (var user in users)
        {
            var roles = await _users.GetRolesAsync(user);
            response.Add(new UserResponse(
                user.Id,
                user.Email ?? string.Empty,
                user.DisplayName,
                roles.FirstOrDefault() ?? string.Empty,
                user.MechanicId));
        }

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<UserResponse>> Create(CreateUserRequest request)
    {
        if (!Roles.All.Contains(request.Role))
        {
            ModelState.AddModelError(nameof(request.Role),
                $"Role must be one of: {string.Join(", ", Roles.All)}.");
            return ValidationProblem(ModelState);
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,
            DisplayName = request.DisplayName,
            MechanicId = request.MechanicId
        };

        var created = await _users.CreateAsync(user, request.Password);
        if (!created.Succeeded)
        {
            foreach (var error in created.Errors)
            {
                ModelState.AddModelError(error.Code, error.Description);
            }

            return ValidationProblem(ModelState);
        }

        await _users.AddToRoleAsync(user, request.Role);

        return CreatedAtAction(
            nameof(GetAll),
            new UserResponse(user.Id, request.Email, request.DisplayName, request.Role,
                request.MechanicId));
    }

    /// <summary>
    /// Removes the sign-in. The Mechanic record stays, so the Job Cards they worked keep
    /// their history.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _users.FindByIdAsync(id.ToString());
        if (user is null)
        {
            return NotFound();
        }

        if (id == GetCurrentUserId())
        {
            return Problem(
                detail: "You cannot remove your own sign-in.",
                statusCode: StatusCodes.Status409Conflict);
        }

        var proprietors = await _users.GetUsersInRoleAsync(Roles.Proprietor);
        if (proprietors.Count == 1 && proprietors[0].Id == id)
        {
            return Problem(
                detail: "This is the only Proprietor. Create another one first.",
                statusCode: StatusCodes.Status409Conflict);
        }

        await _users.DeleteAsync(user);
        return NoContent();
    }

    private Guid? GetCurrentUserId() =>
        Guid.TryParse(_users.GetUserId(User), out var id) ? id : null;
}

public record UserResponse(
    Guid Id,
    string Email,
    string DisplayName,
    string Role,
    Guid? MechanicId);

public record CreateUserRequest(
    string Email,
    string Password,
    string DisplayName,
    string Role,
    Guid? MechanicId);
