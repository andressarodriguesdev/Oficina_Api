namespace OficinaMecanica.Domain.Entities;

/// <summary>Registro de quem criou, alterou, inativou ou excluiu cadastros.</summary>
public class LogAuditoria
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid? OficinaId { get; set; }

    public int? UsuarioId { get; set; }

    public string? UsuarioNome { get; set; }

    public string Acao { get; set; } = string.Empty;

    public string Entidade { get; set; } = string.Empty;

    public Guid EntidadeId { get; set; }

    public string? Descricao { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
