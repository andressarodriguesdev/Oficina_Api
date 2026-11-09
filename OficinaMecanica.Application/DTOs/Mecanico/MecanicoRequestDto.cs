using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs
{
    public class MecanicoRequestDto
    {
        public string Nome { get; set; } = string.Empty;
        [System.ComponentModel.DataAnnotations.RegularExpression(@"^(\D*\d){8,13}\D*$", ErrorMessage = "Informe um telefone válido (com DDD).")]
        public string? Telefone { get; set; }
        public string? Especialidade { get; set; }

        
    }
}
