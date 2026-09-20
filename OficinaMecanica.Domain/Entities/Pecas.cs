namespace OficinaMecanica.Domain.Entities;

public class Pecas
{
    public Guid Id { get; private set; }

    public Guid OficinaId { get; private set; }

    public Oficina Oficina { get; private set; } = null!;

    public string Nome { get; private set; } = string.Empty;

    public string? Codigo { get; private set; }

    public decimal ValorCusto { get; private set; }

    public decimal ValorVenda { get; private set; }

    public int QuantidadeEstoque { get; private set; }

    public int EstoqueMinimo { get; private set; }

    public bool Ativa { get; private set; }

    private Pecas()
    {
    }

    public Pecas(
        Guid oficinaId,
        string nome,
        string? codigo,
        decimal valorCusto,
        decimal valorVenda,
        int quantidadeEstoque,
        int estoqueMinimo)
    {
        Id = Guid.NewGuid();
        OficinaId = oficinaId;
        Nome = nome;
        Codigo = codigo;
        ValorCusto = valorCusto;
        ValorVenda = valorVenda;
        QuantidadeEstoque = quantidadeEstoque;
        EstoqueMinimo = estoqueMinimo;
        Ativa = true;
    }

    public void Atualizar(
        string nome,
        string? codigo,
        decimal valorCusto,
        decimal valorVenda,
        int estoqueMinimo)
    {
        Nome = nome;
        Codigo = codigo;
        ValorCusto = valorCusto;
        ValorVenda = valorVenda;
        EstoqueMinimo = estoqueMinimo;
    }

    public void AlterarStatus(bool ativa)
    {
        Ativa = ativa;
    }

    public void AjustarEstoque(int quantidade)
    {
        if (quantidade < 0)
            throw new ArgumentException(
                "A quantidade em estoque não pode ser negativa.",
                nameof(quantidade));

        QuantidadeEstoque = quantidade;
    }

    // Ajusta o estoque e devolve a movimentação para o histórico.
    // Quem chamar deve persistir a movimentação retornada.
    public MovimentacaoEstoque AjustarEstoque(
        int quantidade,
        TipoMovimentacaoEstoque tipo,
        Guid? ordemServicoId = null,
        string? motivo = null)
    {
        var anterior = QuantidadeEstoque;

        AjustarEstoque(quantidade);

        return new MovimentacaoEstoque(
            OficinaId,
            Id,
            tipo,
            anterior,
            quantidade,
            ordemServicoId,
            motivo);
    }
}