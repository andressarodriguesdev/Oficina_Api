using Microsoft.AspNetCore.Identity;

namespace GarageManager.Infrastructure.Identity;

/// <summary>
/// A person who can sign in to this Workshop's installation.
/// </summary>
/// <remarks>
/// Being a User and being a Mechanic are separate things (see CONTEXT.md): work is
/// assigned to a Mechanic whether or not that person ever signs in, and the Proprietor
/// signs in without being a Mechanic. <see cref="MechanicId"/> links the two when the
/// same person is both.
/// </remarks>
public class ApplicationUser : IdentityUser<Guid>
{
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>The Mechanic this User is, when they are one. Null for the Proprietor.</summary>
    public Guid? MechanicId { get; set; }
}
