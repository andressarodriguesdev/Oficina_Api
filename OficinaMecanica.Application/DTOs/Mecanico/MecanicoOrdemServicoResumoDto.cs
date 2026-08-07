using OficinaMecanica.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs.Mecanico
{
   public class MecanicoOrdemServicoResumoDto
    {
        public Guid OrdemServicoId { get; set; }

        public string ClienteNome { get; set; } = string.Empty;

        public string Veiculo { get; set; } = string.Empty;

        public decimal ValorMaoObra { get; set; }

        public StatusOrdemServico Status { get; set; }

        public DateTime DataCriacao { get; set; }

        public DateTime? DataConclusao { get; set; }

    }
}
