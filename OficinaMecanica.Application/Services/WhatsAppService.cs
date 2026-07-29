using System.Text;
using OficinaMecanica.Domain.Entities;

namespace OficinaMecanica.Infrastructure.Services;

public class WhatsAppService
{
    public string GerarLinkAprovacao(OrdemServico ordemServico)
    {
        var mensagem = new StringBuilder();

        mensagem.AppendLine($"Olá, {ordemServico.Cliente.Nome}! Tudo bem?");
        mensagem.AppendLine();

        mensagem.AppendLine(
        $"Mensagem enviada pela {ordemServico.Oficina.Nome}.");
        mensagem.AppendLine();

        mensagem.AppendLine(
            $"Sua Ordem de Serviço #{ordemServico.Id.ToString()[..8].ToUpper()} foi criada e está aguardando sua aprovação."
        );

        mensagem.AppendLine();

        mensagem.AppendLine("Veículo:");
        mensagem.AppendLine(
            $"{ordemServico.Veiculo.Marca} {ordemServico.Veiculo.Modelo} - {ordemServico.Veiculo.Placa}"
        );

        mensagem.AppendLine();

        mensagem.AppendLine("Serviço solicitado:");
        mensagem.AppendLine(ordemServico.Descricao);


        if (ordemServico.Mecanico != null)
        {
            mensagem.AppendLine();

            mensagem.AppendLine("Mecânico responsável:");
            mensagem.AppendLine(ordemServico.Mecanico.Nome);
        }


        mensagem.AppendLine();

        mensagem.AppendLine("Mão de obra:");
        mensagem.AppendLine(
            $"R$ {ordemServico.ValorMaoObra:N2}"
        );


        if (ordemServico.Itens.Any())
        {
            mensagem.AppendLine();

            mensagem.AppendLine("Peças e materiais:");

            foreach (var item in ordemServico.Itens)
            {
                mensagem.AppendLine(
                    $"- {item.Descricao} ({item.Quantidade}x) - R$ {item.ValorTotal:N2}"
                );
            }
        }


        mensagem.AppendLine();

        mensagem.AppendLine("Valor total da ordem de serviço:");
        mensagem.AppendLine(
            $"R$ {ordemServico.ValorTotal:N2}"
        );


        mensagem.AppendLine();

        mensagem.AppendLine(
            "Para aprovar ou recusar o serviço:"
        );

        mensagem.AppendLine();

        mensagem.AppendLine(
            "Responda SIM para aprovar."
        );

        mensagem.AppendLine(
            "Responda NÃO para recusar."
        );


        mensagem.AppendLine();

        mensagem.AppendLine(
            "Caso tenha alguma dúvida, estamos à disposição."
        );


        var telefone = ordemServico.Cliente.Telefone
            .Replace("(", "")
            .Replace(")", "")
            .Replace("-", "")
            .Replace(" ", "");


        var textoCodificado = Uri.EscapeDataString(
            mensagem.ToString()
        );


        return $"https://wa.me/55{telefone}?text={textoCodificado}";
    }
}