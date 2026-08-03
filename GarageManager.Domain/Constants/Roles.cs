namespace GarageManager.Domain.Constants;

/// <summary>
/// The two roles a User can hold. See CONTEXT.md — a Mechanic may or may not be a
/// User, and a User need not be a Mechanic.
/// </summary>
public static class Roles
{
    /// <summary>The User who owns and runs the Workshop.</summary>
    public const string Proprietor = "Proprietor";

    /// <summary>A User who carries out repairs and works Job Cards.</summary>
    public const string Mechanic = "Mechanic";

    public static readonly string[] All = [Proprietor, Mechanic];
}
