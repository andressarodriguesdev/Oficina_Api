using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs.Financeiro
{
    public class ProdutividadeMecanicoDto
    {
        public Guid MecanicoId { get; set; }

        public string Nome { get; set; } = string.Empty;

        public int QuantidadeOrdens { get; set; }

        public int QuantidadeConcluidas { get; set; }

        public decimal TotalMaoObra { get; set; }

        public decimal TicketMedio { get; set; }
    }
}
