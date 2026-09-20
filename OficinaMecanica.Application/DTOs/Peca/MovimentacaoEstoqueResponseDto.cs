namespace OficinaMecanica.Application.DTOs.Pecas;

public class MovimentacaoEstoqueResponseDto
{
    public Guid Id { get; set; }

    public string Tipo { get; set; } = string.Empty;

    // Variação com sinal (+ entrada / - saída).
    public int Quantidade { get; set; }

    public int QuantidadeAnterior { get; set; }

    public int QuantidadePosterior { get; set; }

    public Guid? OrdemServicoId { get; set; }

    public string? Motivo { get; set; }

    public DateTime CriadoEm { get; set; }
}
