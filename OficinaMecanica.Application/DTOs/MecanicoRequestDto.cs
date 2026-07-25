using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs
{
    public class MecanicoRequestDto
    {
        public string Nome { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public string? Especialidade { get; set; }

        public Guid OficinaId { get; set; }
    }
}
