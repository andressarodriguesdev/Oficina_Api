namespace GarageManager.Application.DTOs;

public class FinanceResponseDto
{
    public decimal TotalInvoiced { get; set; }

    public decimal TotalLabour { get; set; }

    public decimal TotalParts { get; set; }

    public int JobCardCount { get; set; }

    public int CompletedCount { get; set; }

    public int PendingCount { get; set; }

    public int CancelledCount { get; set; }

    public decimal TotalForecast { get; set; }

    public List<FinanceJobCardDto> JobCards { get; set; } = new();
}

public class FinanceJobCardDto
{
    public Guid Id { get; set; }

    public string Customer { get; set; } = string.Empty;

    public string Vehicle { get; set; } = string.Empty;

    public decimal Labour { get; set; }

    public decimal Parts { get; set; }

    public decimal Total { get; set; }

    public int Status { get; set; }

    public DateTime Date { get; set; }
}
