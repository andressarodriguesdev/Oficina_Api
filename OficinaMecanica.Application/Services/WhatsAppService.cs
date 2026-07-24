using System.Text;
using OficinaMecanica.Domain.Entities;

namespace OficinaMecanica.Infrastructure.Services;

public class WhatsAppService
{
    public string GerarLinkAprovacao(OrdemServico ordemServico)
    {
        var mensagem = new StringBuilder();


        mensagem.AppendLine($"Olá, {ordemServico.Cliente.Nome}!");
        mensagem.AppendLine();


        mensagem.AppendLine(
            $"Sua Ordem de Serviço #{ordemServico.Id.ToString()[..8].ToUpper()} foi enviada para aprovação."
        );

        mensagem.AppendLine();


        mensagem.AppendLine($"Veículo: {ordemServico.Veiculo.Modelo}");

        mensagem.AppendLine();


        mensagem.AppendLine("Serviço:");
        mensagem.AppendLine(ordemServico.Descricao);

        mensagem.AppendLine();


        mensagem.AppendLine("Mão de obra:");
        mensagem.AppendLine($"R$ {ordemServico.ValorMaoObra:F2}");



        if (ordemServico.Itens.Any())
        {
            mensagem.AppendLine();

            mensagem.AppendLine("Peças / Materiais:");

            foreach (var item in ordemServico.Itens)
            {
                mensagem.AppendLine(
                    $"- {item.Descricao} ({item.Quantidade}x) | R$ {item.ValorTotal:F2}"
                );
            }
        }


        mensagem.AppendLine();

        mensagem.AppendLine(
            $"Total da Ordem de Serviço: R$ {ordemServico.ValorTotal:F2}"
        );


        mensagem.AppendLine();

        mensagem.AppendLine(
            "Responda SIM para aprovar o serviço."
        );

        mensagem.AppendLine(
            "Responda NÃO para recusar o serviço."
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