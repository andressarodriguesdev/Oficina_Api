using System;
using OficinaMecanica.Domain.Enums;

namespace OficinaMecanica.Domain.Entities;

public class HistoricoOrdemServico
{
    public Guid Id { get; private set; }

    public Guid OrdemServicoId { get; private set; }
    public OrdemServico OrdemServico { get; private set; } = null!;

    public StatusOrdemServico StatusAnterior { get; private set; }

    public StatusOrdemServico NovoStatus { get; private set; }

    public string? Observacao { get; private set; }

    public DateTime DataAlteracao { get; private set; }

    private HistoricoOrdemServico()
    {
    }

    public HistoricoOrdemServico(
        Guid ordemServicoId,
        StatusOrdemServico statusAnterior,
        StatusOrdemServico novoStatus,
        string? observacao = null)
    {
        Id = Guid.NewGuid();
        OrdemServicoId = ordemServicoId;
        StatusAnterior = statusAnterior;
        NovoStatus = novoStatus;
        Observacao = observacao;
        DataAlteracao = DateTime.UtcNow;
    }
}