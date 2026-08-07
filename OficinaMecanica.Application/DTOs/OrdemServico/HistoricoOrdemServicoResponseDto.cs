using OficinaMecanica.Domain.Enums;

namespace OficinaMecanica.Application.DTOs;

public class HistoricoOrdemServicoResponseDto
{
    public Guid Id { get; set; }

    public Guid OrdemServicoId { get; set; }

    public StatusOrdemServico StatusAnterior { get; set; }

    public StatusOrdemServico NovoStatus { get; set; }

    public string? Observacao { get; set; }

    public DateTime DataAlteracao { get; set; }
}