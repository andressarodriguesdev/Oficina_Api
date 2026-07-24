using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs;

public class AtualizarOrdemServicoDto
{
    public Guid ClienteId { get; set; }

    public Guid VeiculoId { get; set; }

    public string Descricao { get; set; } = string.Empty;

    public decimal ValorMaoObra { get; set; }

    public decimal ValorTotal { get; set; }

    public string? Observacao { get; set; }
}