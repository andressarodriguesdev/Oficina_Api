using System;

using OficinaMecanica.Domain.Enums;

namespace OficinaMecanica.Application.DTOs;

public class OrdemServicoResponseDto

{

    public Guid Id { get; set; }

    public Guid ClienteId { get; set; }

    public Guid VeiculoId { get; set; }

    public string Descricao { get; set; } = string.Empty;

    public decimal Valor { get; set; }

    public StatusOrdemServico Status { get; set; }

    public DateTime DataCriacao { get; set; }

    public DateTime? DataEnvioAprovacao { get; set; }

    public DateTime? DataConclusao { get; set; }

    public DateTime? DataCancelamento { get; set; }

    public string? MotivoCancelamento { get; set; }

    public DateTime? DataReabertura { get; set; }

    public string? MotivoReabertura { get; set; }

}