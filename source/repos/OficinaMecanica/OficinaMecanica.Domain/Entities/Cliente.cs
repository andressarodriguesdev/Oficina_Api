using System;
using System.Collections.Generic;
using System.Text;
namespace OficinaMecanica.Domain.Entities;

public class Cliente
{
    public Guid Id { get; private set; }

    public string Nome { get; private set; }

    public string Telefone { get; private set; }

    public string Email { get; private set; }

    public Guid OficinaId { get; private set; }

    public Oficina Oficina { get; private set; } = null!;

    public ICollection<Veiculo> Veiculos { get; private set; } = new List<Veiculo>();

    public ICollection<OrdemServico> OrdensServico { get; private set; } = new List<OrdemServico>();


    private Cliente()
    {
        Nome = string.Empty;
        Telefone = string.Empty;
        Email = string.Empty;
    }


    public Cliente(
        string nome,
        string telefone,
        string email,
        Guid oficinaId)
    {
        Id = Guid.NewGuid();
        Nome = nome;
        Telefone = telefone;
        Email = email;
        OficinaId = oficinaId;
    }


    public void Atualizar(
        string nome,
        string telefone,
        string email)
    {
        Nome = nome;
        Telefone = telefone;
        Email = email;
    }
}