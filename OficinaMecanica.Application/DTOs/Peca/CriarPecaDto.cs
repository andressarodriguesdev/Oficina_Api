namespace OficinaMecanica.Application.DTOs.Pecas;

public class CriarPecaDto
{
    public string Nome { get; set; } = string.Empty;

    public string? Codigo { get; set; }

    public decimal ValorCusto { get; set; }

    public decimal ValorVenda { get; set; }

    public int QuantidadeEstoque { get; set; }

    public int EstoqueMinimo { get; set; }
}