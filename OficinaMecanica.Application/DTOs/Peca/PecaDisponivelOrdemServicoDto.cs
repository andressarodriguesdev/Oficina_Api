namespace OficinaMecanica.Application.DTOs.Pecas;

public class PecaDisponivelOrdemServicoDto
{
    public Guid Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string? Codigo { get; set; }

    public decimal ValorVenda { get; set; }

    // Estoque físico total cadastrado para a peça.
    public int QuantidadeEstoque { get; set; }

    // Quantidade reservada por outras Ordens de Serviço ativas.
    public int QuantidadeReservadaOutrasOrdens { get; set; }

    // Quantidade que já está reservada pela própria OS em edição.
    public int QuantidadeReservadaNestaOrdem { get; set; }

    // Quantidade máxima que a OS atual pode possuir.
    public int QuantidadeDisponivelParaOrdem { get; set; }
}