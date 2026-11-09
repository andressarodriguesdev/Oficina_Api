using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs;

public class CriarVeiculoDto

{

    [System.ComponentModel.DataAnnotations.RegularExpression(@"^[A-Za-z]{3}-?[0-9][A-Za-z0-9][0-9]{2}$", ErrorMessage = "Informe uma placa válida (ex.: ABC1D23 ou ABC-1234).")]
    public string Placa { get; set; } = string.Empty;

    public string Marca { get; set; } = string.Empty;

    public string Modelo { get; set; } = string.Empty;

    public string Ano { get; set; } = string.Empty;

    public Guid ClienteId { get; set; }

}