using OficinaMecanica.Domain.Entities;

public class Usuario
{
    public int Id { get; set; }

    public string Nome { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string SenhaHash { get; set; } = string.Empty;

    public DateTime DataCadastro { get; set; } = DateTime.UtcNow;

    public bool Ativo { get; set; } = true;

    // =====================================================
    // VERIFICAÇÃO DE E-MAIL
    // =====================================================

    public bool EmailVerificado { get; set; } = false;

    public string? EmailVerificationCodeHash { get; set; }

    public DateTime? EmailVerificationCodeExpiresAt { get; set; }

    public int EmailVerificationAttempts { get; set; } = 0;

    public string? EmailVerificationToken { get; set; }

    public DateTime? EmailVerificationTokenExpiresAt { get; set; }

    // =====================================================
    // AUTENTICAÇÃO DE DOIS FATORES
    // =====================================================

    public bool TwoFactorEnabled { get; set; } = false;

    public string? TwoFactorCodeHash { get; set; }

    public DateTime? TwoFactorCodeExpiresAt { get; set; }

    public int TwoFactorAttempts { get; set; } = 0;

    public string? TwoFactorToken { get; set; }

    public DateTime? TwoFactorTokenExpiresAt { get; set; }

    // =====================================================
    // RECUPERAÇÃO DE SENHA
    // =====================================================

    public string? PasswordResetCodeHash { get; set; }

    public DateTime? PasswordResetCodeExpiresAt { get; set; }

    public int PasswordResetAttempts { get; set; } = 0;

    public ICollection<Oficina> Oficinas { get; set; } = new List<Oficina>();
}
