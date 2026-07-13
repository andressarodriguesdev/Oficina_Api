using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Domain.Entities;

public class Cliente
{
    public Guid Id { get; private set; }
    public string Nome { get; private set; }
    public string Telefone { get; private set; }

    public Cliente(string nome, string telefone)
    {
        Id = Guid.NewGuid();
        Nome = nome;
        Telefone = telefone;
    }

    public void Atualizar(string nome, string telefone)

    {

        Nome = nome;

        Telefone = telefone;

    }

    public ICollection<Veiculo> Veiculos { get; private set; } = new List<Veiculo>();

    public ICollection<OrdemServico> OrdensServico { get; private set; } = new List<OrdemServico>();


}
