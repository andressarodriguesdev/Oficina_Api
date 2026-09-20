namespace OficinaMecanica.Domain.Entities;

public class OrdemServicoItem
{
    public Guid Id { get; private set; }

    public Guid OrdemServicoId { get; private set; }

    public OrdemServico OrdemServico { get; private set; } = null!;

    public Guid? PecaId { get; private set; }

    public Pecas? Peca { get; private set; }

    public string Descricao { get; private set; } = string.Empty;

    public int Quantidade { get; private set; }

    public decimal ValorUnitario { get; private set; }

    public decimal ValorTotal => Quantidade * ValorUnitario;

    private OrdemServicoItem()
    {
    }

    public OrdemServicoItem(
        string descricao,
        int quantidade,
        decimal valorUnitario,
        Guid? pecaId = null)
    {
        Id = Guid.NewGuid();

        Descricao = descricao;
        Quantidade = quantidade;
        ValorUnitario = valorUnitario;
        PecaId = pecaId;
    }

    public void Atualizar(
        string descricao,
        int quantidade,
        decimal valorUnitario,
        Guid? pecaId = null)
    {
        Descricao = descricao;
        Quantidade = quantidade;
        ValorUnitario = valorUnitario;
        PecaId = pecaId;
    }
}