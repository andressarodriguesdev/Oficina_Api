using System;

namespace OficinaMecanica.Domain.Entities;

public class OrdemServicoItem
{
    public Guid Id { get; private set; }

    public Guid OrdemServicoId { get; private set; }

    public OrdemServico OrdemServico { get; private set; } = null!;


    // Nome da peça ou material
    public string Descricao { get; private set; } = string.Empty;


    // Quantidade utilizada
    public int Quantidade { get; private set; }


    // Valor de uma unidade
    public decimal ValorUnitario { get; private set; }


    // Quantidade x valor unitário
    public decimal ValorTotal => Quantidade * ValorUnitario;


    // Usado pelo Entity Framework
    private OrdemServicoItem()
    {
    }


    public OrdemServicoItem(
        string descricao,
        int quantidade,
        decimal valorUnitario
    )
    {
        Id = Guid.NewGuid();

        Descricao = descricao;
        Quantidade = quantidade;
        ValorUnitario = valorUnitario;
    }
}