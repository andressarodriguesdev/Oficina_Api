using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs;

public class CriarOficinaDto
{
    public string Nome { get; set; } = string.Empty;

    public string Telefone { get; set; } = string.Empty;

    public string Endereco { get; set; } = string.Empty;

    public string? Logotipo { get; set; }
}