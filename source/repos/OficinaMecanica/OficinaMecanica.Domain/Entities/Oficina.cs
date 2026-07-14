using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Domain.Entities
{
    public class Oficina
    {
        public Guid Id { get; private set; }

        public string Nome { get; private set; } = string.Empty;

        public string Telefone { get; private set; } = string.Empty;

        public string Endereco { get; private set; } = string.Empty;


        public string? Logotipo { get; private set; }


        // Usado pelo Entity Framework

        private Oficina() { } 
        public Oficina( 
            string nome, 
            string telefone, 
            string endereco, 
            string? logotipo = null) 
        { 
            Id = Guid.NewGuid();
            Nome = nome; 
            Telefone = telefone; 
            Endereco = endereco; 
            Logotipo = logotipo; 
        }


    }
}
