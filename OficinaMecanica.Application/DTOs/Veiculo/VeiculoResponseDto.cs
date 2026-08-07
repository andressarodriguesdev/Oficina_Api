using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs;

public class VeiculoResponseDto

{

    public Guid Id { get; set; }

    public string Placa { get; set; } = string.Empty;

    public string Marca { get; set; } = string.Empty;

    public string Modelo { get; set; } = string.Empty;

    public string Ano { get; set; } = string.Empty;

    public bool Ativo { get; set; }

    public Guid ClienteId { get; set; }

    public Guid OficinaId { get; set; }

    public List<VeiculoOrdemServicoResumoDto> OrdensServico { get; set; } = new();

}
