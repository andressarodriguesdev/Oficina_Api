namespace OficinaMecanica.Application.DTOs.Oficina;

public class AtualizarOficinaDto
{
    public string Nome { get; set; } = string.Empty;

    public string Telefone { get; set; } = string.Empty;

    public string Endereco { get; set; } = string.Empty;

    public string? Logotipo { get; set; }
}