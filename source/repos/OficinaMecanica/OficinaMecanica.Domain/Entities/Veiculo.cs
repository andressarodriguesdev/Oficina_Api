using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Domain.Entities; 
public class Veiculo
{
    public Guid Id { get; private set; }
    public string Placa { get; private set; }
    public string Marca { get; private set; } 
    public string Modelo { get; private set; }
    public Guid ClienteId { get; private set; } 
    public Cliente Cliente { get; private set; } = null!;

    public ICollection<OrdemServico> OrdensServico { get; private set; } = new List<OrdemServico>();
    public Veiculo(string placa, string marca, string modelo, Guid clienteId) 
    { 
        Id = Guid.NewGuid();
        Placa = placa;
        Marca = marca; 
        Modelo = modelo;
        ClienteId = clienteId; } 
    
    // Construtor vazio para o Entity Framework
    private Veiculo()
    {
     Placa = string.Empty;
     Marca = string.Empty;
     Modelo = string.Empty;
     Cliente = null!;
     }

    public void Atualizar(string placa, string marca, string modelo)

    {

        Placa = placa;

        Marca = marca;

        Modelo = modelo;

    }


}