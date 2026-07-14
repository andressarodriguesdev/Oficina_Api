using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Domain.Entities;

namespace OficinaMecanica.Application.Mappers;

public static class OrdemServicoMapper
{
    public static OrdemServico ToEntity(OrdemServicoResponseDto dto)
    {
        return new OrdemServico(
            Guid.Empty,
            dto.ClienteId,
            dto.VeiculoId,
            dto.Descricao,
            dto.Valor
        );
    }
}