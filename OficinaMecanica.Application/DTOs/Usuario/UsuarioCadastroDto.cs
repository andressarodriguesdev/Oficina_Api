using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs.Usuario
{
    public class UsuarioCadastroDto
    { 
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty; 
        public string Senha { get; set; } = string.Empty; 
    }
}
