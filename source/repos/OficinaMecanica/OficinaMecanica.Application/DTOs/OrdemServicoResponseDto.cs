using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Domain.Enums;

public class OrdemServicoResponseDto
{
    public Guid Id { get; set; }

    public Guid ClienteId { get; set; }

    public Guid VeiculoId { get; set; }

    public ClienteResponseDto? Cliente { get; set; }

    public VeiculoResponseDto? Veiculo { get; set; }

    public string Descricao { get; set; } = string.Empty;


    // Valor da mão de obra
    public decimal ValorMaoObra { get; set; }


    // Valor total = mão de obra + itens
    public decimal ValorTotal { get; set; }


    public List<OrdemServicoItemDto> Itens { get; set; } = new();


    public StatusOrdemServico Status { get; set; }


    public DateTime DataCriacao { get; set; }

    public DateTime? DataEnvioAprovacao { get; set; }

    public DateTime? DataConclusao { get; set; }

    public DateTime? DataCancelamento { get; set; }

    public string? MotivoCancelamento { get; set; }

    public DateTime? DataReabertura { get; set; }

    public string? MotivoReabertura { get; set; }


    public List<HistoricoOrdemServicoResponseDto> Historicos { get; set; } = new();
}