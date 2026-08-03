using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using GarageManager.Domain.Entities;

namespace GarageManager.Infrastructure.Services;

public class JobCardPdfService
{
    public byte[] GeneratePdf(JobCard jobCard)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        var primaryColor = Colors.Orange.Medium;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken3));

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(c =>
                    {
                        c.Item().Text(jobCard.Customer.Workshop.Name).FontSize(20).Bold().FontColor(primaryColor);
                        c.Item().Text("JOB CARD").FontSize(9).SemiBold();
                    });
                    row.RelativeItem().AlignRight().Column(c =>
                    {
                        c.Item().Text($"Job Card #{jobCard.Id.ToString()[..8].ToUpper()}").FontSize(14).Bold();
                        c.Item().Text($"Date: {jobCard.CreatedAt:dd/MM/yyyy}");
                    });
                });

                page.Content().PaddingVertical(15).Column(column =>
                {
                    column.Spacing(15);

                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                        {
                            c.Item().Text("CUSTOMER")
                                .FontSize(8)
                                .Bold()
                                .FontColor(primaryColor);

                            c.Item().Text($"Name: {jobCard.Customer.Name}");
                            c.Item().Text($"Phone: {jobCard.Customer.Phone}");
                            c.Item().Text($"Email: {jobCard.Customer.Email}");
                        });

                        row.ConstantItem(10);

                        row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                        {
                            c.Item().Text("VEHICLE")
                                .FontSize(8)
                                .Bold()
                                .FontColor(primaryColor);

                            c.Item().Text($"{jobCard.Vehicle.Make} {jobCard.Vehicle.Model}");
                            c.Item().Text($"Reg. No: {jobCard.Vehicle.RegistrationNumber}");
                            c.Item().Text($"Year: {jobCard.Vehicle.Year}");
                        });

                        row.ConstantItem(10);

                        row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c =>
                        {
                            c.Item().Text("MECHANIC")
                                .FontSize(8)
                                .Bold()
                                .FontColor(primaryColor);

                            if (jobCard.Mechanic != null)
                            {
                                c.Item().Text($"Name: {jobCard.Mechanic.Name}");
                                c.Item().Text($"Phone: {jobCard.Mechanic.Phone}");
                                c.Item().Text($"Speciality: {jobCard.Mechanic.Speciality}");
                            }
                            else
                            {
                                c.Item().Text("Not assigned");
                            }
                        });
                    });

                    column.Item().Column(c => {
                        c.Item().Text("DESCRIPTION").FontSize(8).Bold().FontColor(primaryColor);
                        c.Item().Padding(5).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Text(jobCard.Description);
                    });

                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns => {
                            columns.RelativeColumn(3); columns.RelativeColumn(1); columns.RelativeColumn(1); columns.RelativeColumn(1);
                        });
                        table.Header(header => {
                            header.Cell().Element(s => s.BorderBottom(1).BorderColor(primaryColor).Padding(5)).Text("Item / Service").Bold();
                            header.Cell().Element(s => s.BorderBottom(1).BorderColor(primaryColor).Padding(5)).AlignCenter().Text("Qty").Bold();
                            header.Cell().Element(s => s.BorderBottom(1).BorderColor(primaryColor).Padding(5)).AlignRight().Text("Unit price").Bold();
                            header.Cell().Element(s => s.BorderBottom(1).BorderColor(primaryColor).Padding(5)).AlignRight().Text("Total").Bold();
                        });

                        table.Cell().Padding(5).Text("Labour");
                        table.Cell().Padding(5).AlignCenter().Text("-");
                        table.Cell().Padding(5).AlignRight().Text("-");
                        table.Cell().Padding(5).AlignRight().Text($"€ {jobCard.LabourCharge:F2}");

                        foreach (var part in jobCard.Parts)
                        {
                            table.Cell().Padding(5).Text(part.Description);
                            table.Cell().Padding(5).AlignCenter().Text(part.Quantity.ToString());
                            table.Cell().Padding(5).AlignRight().Text($"€ {part.UnitPrice:F2}");
                            table.Cell().Padding(5).AlignRight().Text($"€ {part.Total:F2}");
                        }
                    });

                    column.Item().PaddingTop(10).Row(row => {
                        row.RelativeItem().Column(c => {
                            c.Item().Text("NOTES").FontSize(8).Bold().FontColor(primaryColor);
                            c.Item().Text("Thank you for your business. 90-day warranty on work carried out.");
                        });
                        row.RelativeItem().AlignRight().Column(c => {
                            c.Item().Text("TOTAL AMOUNT").FontSize(8).Bold();
                            c.Item().Text($"€ {jobCard.TotalAmount:F2}").FontSize(16).Bold().FontColor(primaryColor);
                        });
                    });

                    column.Item().PaddingTop(30).Row(row => {
                        row.RelativeItem().Column(c => { c.Item().PaddingHorizontal(10).LineHorizontal(0.5f); c.Item().AlignCenter().Text("Customer signature"); });
                        row.RelativeItem().Column(c => { c.Item().PaddingHorizontal(10).LineHorizontal(0.5f); c.Item().AlignCenter().Text("Mechanic signature"); });
                    });
                });
            });
        }).GeneratePdf();
    }
}
