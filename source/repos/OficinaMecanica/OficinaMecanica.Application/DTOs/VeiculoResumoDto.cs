using System;

namespace OficinaMecanica.Application.DTOs;

public class VeiculoResumoDto
{
    public Guid Id { get; set; }

    public string Placa { get; set; } = string.Empty;

    public string Marca { get; set; } = string.Empty;

    public string Modelo { get; set; } = string.Empty;

}