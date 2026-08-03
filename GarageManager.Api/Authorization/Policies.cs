namespace GarageManager.Api.Authorization;

/// <summary>
/// Named authorization policies. Controllers reference these instead of spelling out
/// roles, so that changing who may do what is a change in one file.
/// </summary>
public static class Policies
{
    /// <summary>
    /// Anyone who works at the Workshop — Proprietor or Mechanic. The default for
    /// day-to-day work: opening Job Cards, recording Parts, looking up Customers.
    /// </summary>
    public const string WorkshopStaff = nameof(WorkshopStaff);

    /// <summary>
    /// The Proprietor alone. Money, staff records, and anything that changes what has
    /// already been agreed with the Customer.
    /// </summary>
    public const string ProprietorOnly = nameof(ProprietorOnly);
}
