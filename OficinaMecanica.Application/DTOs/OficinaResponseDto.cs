using System;
using System.Collections.Generic;
using System.Text;
using System;

namespace OficinaMecanica.Application.DTOs;

public class OficinaResponseDto
{
    public Guid Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Telefone { get; set; } = string.Empty;

    public string Endereco { get; set; } = string.Empty;

    public string? Logotipo { get; set; }
}