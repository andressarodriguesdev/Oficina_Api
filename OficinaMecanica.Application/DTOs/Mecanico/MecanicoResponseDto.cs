using OficinaMecanica.Application.DTOs.Mecanico;
using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs
{
    public class MecanicoResponseDto
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Telefone { get; set; }
        public string? Especialidade { get; set; }

        public int QuantidadeOrdensServico { get; set; }

        public int QuantidadeConcluidas { get; set; }

        public int QuantidadeCanceladas { get; set; }

        public decimal TotalMaoObra { get; set; }

        public Guid OficinaId { get; set; }

        public List<MecanicoOrdemServicoResumoDto> OrdensServico { get; set; } = new();
    }
}
