using System;
using OficinaMecanica.Domain.Enums;


namespace OficinaMecanica.Domain.Entities;

public class OrdemServico
{
    public Guid Id { get; private set; }

    public Guid ClienteId { get; private set; }
    public Cliente Cliente { get; private set; } = null!;

    public Guid VeiculoId { get; private set; }
    public Veiculo Veiculo { get; private set; } = null!;

    public string Descricao { get; private set; } = null!;

    public decimal Valor { get; private set; }

    public StatusOrdemServico Status { get; private set; }

    public DateTime DataCriacao { get; private set; }

    public DateTime? DataEnvioAprovacao { get; private set; }

    public DateTime? DataConclusao { get; private set; }

    public DateTime? DataCancelamento { get; private set; }

    public string? MotivoCancelamento { get; private set; }

    public DateTime? DataReabertura { get; private set; }

    public string? MotivoReabertura { get; private set; }


    // Usado pelo Entity Framework
    private OrdemServico()
    {
    }


    public OrdemServico(
        Guid clienteId,
        Guid veiculoId,
        string descricao,
        decimal valor)
    {
        Id = Guid.NewGuid();

        ClienteId = clienteId;
        VeiculoId = veiculoId;

        Descricao = descricao;
        Valor = valor;

        Status = StatusOrdemServico.Aberta;

        DataCriacao = DateTime.UtcNow;
    }


    public void EnviarParaAprovacao()
    {
        if (Status != StatusOrdemServico.Aberta)
            throw new Exception("Somente ordens abertas podem ser enviadas para aprovação.");

        Status = StatusOrdemServico.AguardandoAprovacao;

        DataEnvioAprovacao = DateTime.UtcNow;
    }


    public void Aprovar()
    {
        if (Status != StatusOrdemServico.AguardandoAprovacao &&
            Status != StatusOrdemServico.Reaberta)
            throw new Exception("Somente ordens aguardando aprovação ou reabertas podem ser aprovadas.");

        Status = StatusOrdemServico.Aprovada;
    }


    public void Recusar()
    {
        if (Status != StatusOrdemServico.AguardandoAprovacao)
            throw new Exception("Somente ordens aguardando aprovação podem ser recusadas.");

        Status = StatusOrdemServico.Recusada;
    }


    public void Concluir()
    {
        if (Status != StatusOrdemServico.Aprovada &&
            Status != StatusOrdemServico.Reaberta)
            throw new Exception("Somente ordens aprovadas ou reabertas podem ser concluídas.");

        Status = StatusOrdemServico.Concluida;

        DataConclusao = DateTime.UtcNow;
    }


    public void Cancelar(string motivo)
    {
        if (Status == StatusOrdemServico.Concluida)
            throw new Exception("Não é possível cancelar uma ordem de serviço concluída.");

        if (Status == StatusOrdemServico.Cancelada)
            throw new Exception("A ordem de serviço já está cancelada.");

        if (string.IsNullOrWhiteSpace(motivo))
            throw new Exception("O motivo do cancelamento é obrigatório.");

        Status = StatusOrdemServico.Cancelada;

        MotivoCancelamento = motivo;

        DataCancelamento = DateTime.UtcNow;
    }


    public void Reabrir(string motivo)
    {
        if (Status != StatusOrdemServico.Concluida)
            throw new Exception("Somente ordens concluídas podem ser reabertas.");

        if (string.IsNullOrWhiteSpace(motivo))
            throw new Exception("O motivo da reabertura é obrigatório.");

        Status = StatusOrdemServico.Reaberta;

        MotivoReabertura = motivo;

        DataReabertura = DateTime.UtcNow;
    }
}