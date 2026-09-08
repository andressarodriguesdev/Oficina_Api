using Microsoft.Extensions.Options;
using OficinaMecanica.Api.Configurations;
using Resend;

namespace OficinaMecanica.Api.Services
{
    public class ResendEmailService
    {
        private readonly ResendClient _resendClient;

        public ResendEmailService(ResendClient resendClient)
        {
            _resendClient = resendClient;
        }

        public async Task EnviarEmailAsync(
            string destinatario,
            string assunto,
            string html)
        {
            var mensagem = new EmailMessage();

            mensagem.From = "Oficina Prime <seguranca@oficinaprime.store>";
            mensagem.To.Add(destinatario);
            mensagem.Subject = assunto;
            mensagem.HtmlBody = html;

            await _resendClient.EmailSendAsync(mensagem);
        }
    }
   }
