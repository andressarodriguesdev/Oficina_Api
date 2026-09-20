using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs.Usuario;

public class RedefinirSenhaDto
{
    public string Email { get; set; } = string.Empty;

    public string Code { get; set; } = string.Empty;

    public string NovaSenha { get; set; } = string.Empty;
}
