namespace OficinaMecanica.Application.DTOs;

// OrdemServicoItemDto.cs
public class OrdemServicoItemDto
{
    public Guid Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public decimal ValorUnitario { get; set; }
}