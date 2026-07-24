using System;
using System.Collections.Generic;

namespace OficinaMecanica.Application.DTOs;

public class ClienteDetalhadoResponseDto
{
    public Guid Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Telefone { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public List<VeiculoResumoDto> Veiculos { get; set; } = new();

}