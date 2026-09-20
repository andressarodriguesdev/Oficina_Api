namespace OficinaMecanica.Domain.Entities;

public enum TipoMovimentacaoEstoque
{
    SaldoInicial = 1,
    AjusteManual = 2,
    SaidaOrdemServico = 3,
    EstornoReabertura = 4
}

public class MovimentacaoEstoque
{
    public Guid Id { get; private set; }

    public Guid OficinaId { get; private set; }

    public Guid PecaId { get; private set; }

    public Pecas Peca { get; private set; } = null!;

    public TipoMovimentacaoEstoque Tipo { get; private set; }

    // Variação com sinal: positiva = entrada, negativa = saída.
    public int Quantidade { get; private set; }

    public int QuantidadeAnterior { get; private set; }

    public int QuantidadePosterior { get; private set; }

    // Preenchido quando a movimentação nasce de uma Ordem de Serviço.
    public Guid? OrdemServicoId { get; private set; }

    public string? Motivo { get; private set; }

    public DateTime CriadoEm { get; private set; }

    private MovimentacaoEstoque()
    {
    }

    public MovimentacaoEstoque(
        Guid oficinaId,
        Guid pecaId,
        TipoMovimentacaoEstoque tipo,
        int quantidadeAnterior,
        int quantidadePosterior,
        Guid? ordemServicoId = null,
        string? motivo = null)
    {
        Id = Guid.NewGuid();
        OficinaId = oficinaId;
        PecaId = pecaId;
        Tipo = tipo;
        QuantidadeAnterior = quantidadeAnterior;
        QuantidadePosterior = quantidadePosterior;
        Quantidade = quantidadePosterior - quantidadeAnterior;
        OrdemServicoId = ordemServicoId;
        Motivo = motivo;
        CriadoEm = DateTime.UtcNow;
    }
}
