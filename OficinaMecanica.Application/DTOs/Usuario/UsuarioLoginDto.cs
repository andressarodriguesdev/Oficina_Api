using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs.Usuario;

public class UsuarioLoginDto
{
    public string Email { get; set; } = string.Empty;

    public string Senha { get; set; } = string.Empty;
}
