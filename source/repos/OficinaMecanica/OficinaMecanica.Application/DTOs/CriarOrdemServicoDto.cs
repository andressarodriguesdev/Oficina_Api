using System;

namespace OficinaMecanica.Application.DTOs;

public class CriarOrdemServicoDto

{

    public Guid ClienteId { get; set; }

    public Guid VeiculoId { get; set; }

    public string Descricao { get; set; } = string.Empty;

    public decimal Valor { get; set; }

}