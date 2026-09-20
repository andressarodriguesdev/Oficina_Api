
using System.Security.Cryptography;

namespace OficinaMecanica.Api.Services
{
    public class TwoFactorService
    {
        private readonly ResendEmailService _resendEmailService;

        public TwoFactorService(ResendEmailService resendEmailService)
        {
            _resendEmailService = resendEmailService;
        }

        public string GerarCodigo()
        {
            return RandomNumberGenerator
                .GetInt32(100000, 1000000)
                .ToString();
        }

        public string GerarTokenTemporario()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);

            return Convert.ToBase64String(bytes);
        }

        public string GerarHash(string valor)
        {
            var bytes = System.Text.Encoding.UTF8.GetBytes(valor);

            var hash = SHA256.HashData(bytes);

            return Convert.ToBase64String(hash);
        }

        public bool ValidarCodigo(string codigo, string hashEsperado)
        {
            var hashCodigo = GerarHash(codigo);

            return CryptographicOperations.FixedTimeEquals(
                Convert.FromBase64String(hashCodigo),
                Convert.FromBase64String(hashEsperado)
            );
        }

        public async Task EnviarCodigoPorEmailAsync(
            string email,
            string codigo)
        {
            var assunto = "Código de verificação - Oficina Prime";

            var html = $"""
                <html>
                    <body>
                        <h2>Código de verificação</h2>

                        <p>Olá!</p>

                        <p>
                            Seu código de verificação para acessar a
                            <strong>Oficina Prime</strong> é:
                        </p>

                        <h1>{codigo}</h1>

                        <p>
                            Esse código é temporário.
                        </p>

                        <p>
                            Se você não solicitou esse código,
                            ignore este e-mail.
                        </p>
                    </body>
                </html>
                """;

            await _resendEmailService.EnviarEmailAsync(
                email,
                assunto,
                html
            );
        }


        public async Task EnviarCodigoVerificacaoEmailAsync(
        string email,
        string codigo)
        {
            var assunto = "Confirme seu e-mail - Oficina Prime";

            var html = $"""
        <html>
            <body>
                <h2>Confirme seu e-mail</h2>

                <p>Olá!</p>

                <p>
                    Para concluir seu cadastro na
                    <strong>Oficina Prime</strong>,
                    digite o código abaixo:
                </p>

                <h1>{codigo}</h1>

                <p>
                    Esse código é válido por 5 minutos.
                </p>

                <p>
                    Se você não criou uma conta na Oficina Prime,
                    ignore este e-mail.
                </p>
            </body>
        </html>
        """;

            await _resendEmailService.EnviarEmailAsync(
                email,
                assunto,
                html
            );
        }

        // Atenção: a validade informada no e-mail (10 minutos) deve
        // acompanhar a constante RecuperacaoSenhaValidadeMinutos do AuthController.
        public async Task EnviarCodigoRecuperacaoSenhaAsync(
            string email,
            string codigo)
        {
            var assunto = "Recuperação de senha - Oficina Prime";

            var html = $"""
        <html>
            <body>
                <h2>Recuperação de senha</h2>

                <p>Olá!</p>

                <p>
                    Recebemos um pedido para redefinir a senha da sua conta na
                    <strong>Oficina Prime</strong>.
                    Digite o código abaixo para continuar:
                </p>

                <h1>{codigo}</h1>

                <p>
                    Esse código é válido por 10 minutos.
                </p>

                <p>
                    Se você não pediu para redefinir a senha,
                    ignore este e-mail. Sua senha continua a mesma.
                </p>
            </body>
        </html>
        """;

            await _resendEmailService.EnviarEmailAsync(
                email,
                assunto,
                html
            );
        }
    }
}
