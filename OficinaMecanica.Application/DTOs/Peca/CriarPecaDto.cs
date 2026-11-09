namespace OficinaMecanica.Application.DTOs.Pecas;

public class CriarPecaDto
{
    public string Nome { get; set; } = string.Empty;

    public string? Codigo { get; set; }

    [System.ComponentModel.DataAnnotations.Range(typeof(decimal), "0", "1000000000", ErrorMessage = "O valor de custo não pode ser negativo.")]
    public decimal ValorCusto { get; set; }

    [System.ComponentModel.DataAnnotations.Range(typeof(decimal), "0", "1000000000", ErrorMessage = "O valor de venda não pode ser negativo.")]
    public decimal ValorVenda { get; set; }

    [System.ComponentModel.DataAnnotations.Range(0, 1000000, ErrorMessage = "A quantidade em estoque não pode ser negativa.")]
    public int QuantidadeEstoque { get; set; }

    [System.ComponentModel.DataAnnotations.Range(0, 1000000, ErrorMessage = "O estoque mínimo não pode ser negativo.")]
    public int EstoqueMinimo { get; set; }
}