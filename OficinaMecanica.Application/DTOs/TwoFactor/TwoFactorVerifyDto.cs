using System;
using System.Collections.Generic;
using System.Text;

namespace OficinaMecanica.Application.DTOs.TwoFactor
{
    public class TwoFactorVerifyDto
    {
        public string TwoFactorToken { get; set; } = string.Empty;

        public string Code { get; set; } = string.Empty;
    }
}
