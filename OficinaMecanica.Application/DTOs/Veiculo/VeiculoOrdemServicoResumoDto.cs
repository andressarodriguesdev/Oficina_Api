using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs
{
    public class VeiculoOrdemServicoResumoDto
    {
        public Guid OrdemServicoId { get; set; }

        // Usado para restringir o resumo ao mecânico autenticado
        public Guid MecanicoId { get; set; }

        public decimal ValorTotal { get; set; }

        public int StatusAtual { get; set; }

        public DateTime DataCriacao { get; set; }

        public DateTime? DataConclusao { get; set; }
    }
}
