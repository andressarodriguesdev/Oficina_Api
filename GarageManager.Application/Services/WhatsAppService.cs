using System.Text;
using Microsoft.Extensions.Configuration;
using GarageManager.Domain.Entities;

namespace GarageManager.Infrastructure.Services;

public class WhatsAppService
{
    private readonly string _countryCode;

    public WhatsAppService(IConfiguration configuration)
    {
        _countryCode = configuration["WhatsApp:CountryCode"] ?? "356";
    }

    public string GenerateApprovalLink(JobCard jobCard)
    {
        var message = new StringBuilder();

        message.AppendLine($"Hello {jobCard.Customer.Name}!");
        message.AppendLine();

        message.AppendLine(
        $"Message sent by {jobCard.Workshop.Name}.");
        message.AppendLine();

        message.AppendLine(
            $"Your job card #{jobCard.Id.ToString()[..8].ToUpper()} has been created and is awaiting your approval."
        );

        message.AppendLine();

        message.AppendLine("Vehicle:");
        message.AppendLine(
            $"{jobCard.Vehicle.Make} {jobCard.Vehicle.Model} - {jobCard.Vehicle.RegistrationNumber}"
        );

        message.AppendLine();

        message.AppendLine("Work requested:");
        message.AppendLine(jobCard.Description);

        if (jobCard.Mechanic != null)
        {
            message.AppendLine();

            message.AppendLine("Mechanic:");
            message.AppendLine(jobCard.Mechanic.Name);
        }

        message.AppendLine();

        message.AppendLine("Labour:");
        message.AppendLine(
            $"€ {jobCard.LabourCharge:N2}"
        );

        if (jobCard.Parts.Any())
        {
            message.AppendLine();

            message.AppendLine("Parts:");

            foreach (var part in jobCard.Parts)
            {
                message.AppendLine(
                    $"- {part.Description} ({part.Quantity}x) - € {part.Total:N2}"
                );
            }
        }

        message.AppendLine();

        message.AppendLine("Total job card amount:");
        message.AppendLine(
            $"€ {jobCard.TotalAmount:N2}"
        );

        message.AppendLine();

        message.AppendLine(
            "To approve or decline this job:"
        );

        message.AppendLine();

        message.AppendLine(
            "Reply YES to approve."
        );

        message.AppendLine(
            "Reply NO to decline."
        );

        message.AppendLine();

        message.AppendLine(
            "If you have any questions, we're happy to help."
        );

        var phone = jobCard.Customer.Phone
            .Replace("(", "")
            .Replace(")", "")
            .Replace("-", "")
            .Replace(" ", "");

        var encodedText = Uri.EscapeDataString(
            message.ToString()
        );

        return $"https://wa.me/{_countryCode}{phone}?text={encodedText}";
    }
}
