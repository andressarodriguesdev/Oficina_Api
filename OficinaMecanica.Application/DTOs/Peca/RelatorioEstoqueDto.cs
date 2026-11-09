namespace OficinaMecanica.Application.DTOs.Pecas;

public static class SituacaoEstoque
{
    public const string Normal = "Normal";
    public const string EstoqueBaixo = "EstoqueBaixo";
    public const string SemEstoque = "SemEstoque";
}

public class RelatorioEstoqueDto
{
    public DateTime GeradoEm { get; set; }

    public RelatorioEstoqueResumoDto Resumo { get; set; } = new();

    public List<RelatorioEstoqueItemDto> Itens { get; set; } = new();
}

public class RelatorioEstoqueResumoDto
{
    public int TotalPecas { get; set; }

    public int TotalUnidadesEmEstoque { get; set; }

    public int TotalUnidadesReservadas { get; set; }

    public int TotalUnidadesDisponiveis { get; set; }

    // Peças com estoque baixo ou zerado (precisam de reposição).
    public int PecasParaRepor { get; set; }

    public int PecasSemEstoque { get; set; }

    public int PecasComReserva { get; set; }

    // Estoque físico valorizado pelo custo e pelo preço de venda.
    public decimal ValorTotalCusto { get; set; }

    public decimal ValorTotalVenda { get; set; }
}

public class RelatorioEstoqueItemDto
{
    public Guid Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string? Codigo { get; set; }

    public bool Ativa { get; set; }

    public int QuantidadeEstoque { get; set; }

    public int QuantidadeReservada { get; set; }

    public int QuantidadeDisponivel { get; set; }

    public int EstoqueMinimo { get; set; }

    // Quanto falta para atingir o estoque mínimo (0 se já atingiu).
    public int QuantidadeParaRepor { get; set; }

    public decimal ValorCusto { get; set; }

    public decimal ValorVenda { get; set; }

    public decimal ValorTotalCusto { get; set; }

    public decimal ValorTotalVenda { get; set; }

    // Normal | EstoqueBaixo | SemEstoque
    public string Situacao { get; set; } = SituacaoEstoque.Normal;
}
