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

    public Guid ClienteId { get; set; }

}
