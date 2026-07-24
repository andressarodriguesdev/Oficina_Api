namespace OficinaMecanica.Application.DTOs;

public class FinanceiroResponseDto
{
    public decimal TotalFaturado { get; set; }

    public decimal TotalMaoObra { get; set; }

    public decimal TotalPecas { get; set; }

    public int QuantidadeOrdens { get; set; }

    public int QuantidadeConcluidas { get; set; }

    public int QuantidadePendentes { get; set; }

    public int QuantidadeCanceladas { get; set; }

    public decimal TotalPrevisto { get; set; }

    public List<FinanceiroOrdemDto> Ordens { get; set; } = new();
}



public class FinanceiroOrdemDto
{
    public Guid Id { get; set; }

    public string Cliente { get; set; } = string.Empty;

    public string Veiculo { get; set; } = string.Empty;

    public decimal MaoObra { get; set; }

    public decimal Pecas { get; set; }

    public decimal Total { get; set; }

    public int Status { get; set; } 

    public DateTime Data { get; set; }
}