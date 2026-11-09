using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Domain.Entities
{
    public class Mecanico
    {
        public Guid Id { get; set; }

        public string Nome { get; set; } = string.Empty;

        public string Telefone { get; set; } = string.Empty;

        public string? Especialidade { get; set; }

        public bool Ativo { get; set; } = true;

        public Guid OficinaId { get; set; }

        public Oficina Oficina { get; set; } = null!;

        /// <summary>
        /// E-mail do login vinculado a este mecânico (se houver). Não é gravado na
        /// tabela Mecanicos: é preenchido na consulta a partir de Usuario.MecanicoId.
        /// </summary>
        [NotMapped]
        public string? EmailAcesso { get; set; }

        public ICollection<OrdemServico> OrdensServico { get; private set; } = new List<OrdemServico>();
    }
}
