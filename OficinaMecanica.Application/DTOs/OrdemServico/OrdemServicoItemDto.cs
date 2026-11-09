namespace OficinaMecanica.Application.DTOs;

// OrdemServicoItemDto.cs
public class OrdemServicoItemDto
{
    public Guid Id { get; set; }

    public Guid? PecaId { get; set; }

    public string Descricao { get; set; } = string.Empty;

    [System.ComponentModel.DataAnnotations.Range(1, 1000000, ErrorMessage = "A quantidade do item deve ser maior que zero.")]
    public int Quantidade { get; set; }

    [System.ComponentModel.DataAnnotations.Range(typeof(decimal), "0", "1000000000", ErrorMessage = "O valor unitário não pode ser negativo.")]
    public decimal ValorUnitario { get; set; }
}