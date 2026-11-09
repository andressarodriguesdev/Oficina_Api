using System;

namespace OficinaMecanica.Application.DTOs;

public class CriarOrdemServicoDto

{

    public Guid ClienteId { get; set; }

    public Guid VeiculoId { get; set; }

    public Guid MecanicoId { get; set; }

    public string Descricao { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Range(typeof(decimal), "0", "1000000000", ErrorMessage = "O valor da mão de obra não pode ser negativo.")]
    public decimal ValorMaoObra { get; set; }

    public List<OrdemServicoItemDto> Itens { get; set; } = new();

}