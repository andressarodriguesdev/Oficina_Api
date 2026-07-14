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

    public string Ano { get; private set; } 
    public Guid ClienteId { get; private set; } 
    public Cliente Cliente { get; private set; } = null!; 
    public Guid OficinaId { get; private set; } 
    public Oficina Oficina { get; private set; } = null!; 
    public ICollection<OrdemServico> OrdensServico { get; private set; } = new List<OrdemServico>(); 
    public Veiculo(
        string placa, 
        string marca, 
        string modelo, 
        string ano,
        Guid clienteId, 
        Guid oficinaId
        ) 
    { 
        Id = Guid.NewGuid(); 
        Placa = placa; 
        Marca = marca; 
        Modelo = modelo;
        Ano = ano;
        ClienteId = clienteId; 
        OficinaId = oficinaId; 
    } 
    // Construtor vazio para o Entity Framework
    private Veiculo() {
        Placa = string.Empty; 
        Marca = string.Empty; 
        Modelo = string.Empty;
        Ano = string.Empty;
        Cliente = null!;
        Oficina = null!;
    } 
    public void Atualizar
        (
        string placa, 
        string marca, 
        string modelo,
        string ano
        ) { 
        Placa = placa; 
        Marca = marca; 
        Modelo = modelo;
        Ano = ano;
    } 
}