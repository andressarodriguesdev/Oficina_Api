using GarageManager.Domain.Constants;
using GarageManager.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace GarageManager.Api.Identity;

/// <summary>
/// Brings a fresh installation up to a usable state: the two roles exist, and there is
/// one Proprietor who can sign in and create everyone else.
/// </summary>
/// <remarks>
/// This is the installer's job (see docs/adr/0001), which is why the first account comes
/// from configuration rather than from a public sign-up page. Self-service registration
/// does not exist in a dedicated installation.
/// </remarks>
public static class IdentityBootstrap
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration,
        ILogger logger)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>(role));
            }
        }

        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        if (userManager.Users.Any())
        {
            return;
        }

        var email = configuration["Bootstrap:Proprietor:Email"];
        var password = configuration["Bootstrap:Proprietor:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            logger.LogWarning(
                "No users exist and Bootstrap:Proprietor is not configured. Nobody can sign in. "
                + "Set Bootstrap:Proprietor:Email and Bootstrap:Proprietor:Password to create the "
                + "first account.");
            return;
        }

        var proprietor = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            DisplayName = configuration["Bootstrap:Proprietor:DisplayName"] ?? "Proprietor"
        };

        var created = await userManager.CreateAsync(proprietor, password);
        if (!created.Succeeded)
        {
            logger.LogError("Could not create the bootstrap Proprietor: {Errors}",
                string.Join("; ", created.Errors.Select(e => e.Description)));
            return;
        }

        await userManager.AddToRoleAsync(proprietor, Roles.Proprietor);
        logger.LogInformation("Created the bootstrap Proprietor account for {Email}.", email);
    }
}
