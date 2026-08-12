using OficinaMecanica.Application.DTOs.Mecanico;
using OficinaMecanica.Domain.Entities;

using System;
using System.Collections.Generic;
using System.Text;
namespace OficinaMecanica.Application.DTOs.Mecanicos;

public class MecanicoDetalhadoResponseDto
{
    public Guid Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Telefone { get; set; } = string.Empty;

    public string? Especialidade { get; set; }

    public bool Ativo { get; set; }

    public int QuantidadeOrdensServico { get; set; }

    public int QuantidadeConcluidas { get; set; }

    public int QuantidadeCanceladas { get; set; }

    public Guid OficinaId { get; set; }

    public OficinaMecanica.Domain.Entities.Oficina Oficina { get; set; }

    public decimal TotalMaoObra { get; set; }

    public List<MecanicoOrdemServicoResumoDto> OrdensServico { get; set; } = new();
}