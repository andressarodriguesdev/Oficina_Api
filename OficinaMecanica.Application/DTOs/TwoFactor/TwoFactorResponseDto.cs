using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs.TwoFactor
{
    public class TwoFactorResponseDto
    {
        public bool RequiresTwoFactor { get; set; }

        public string? TwoFactorToken { get; set; }

        public string Mensagem { get; set; } = string.Empty;
    }
}
