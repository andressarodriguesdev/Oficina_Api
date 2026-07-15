using OficinaMecanica.Domain.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace OficinaMecanica.Infrastructure.Services;

public class OrdemServicoPdfService
{
    public byte[] GerarPdf(OrdemServico os)
    {
        QuestPDF.Settings.License = LicenseType.Community;

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(35);
                page.Size(PageSizes.A4);


                page.Header()
                .PaddingBottom(15)
                .Row(row =>
                {
                    row.RelativeItem()
                    .Column(col =>
                    {
                        col.Item()
                        .Text(os.Cliente.Oficina.Nome)
                        .FontSize(22)
                        .Bold()
                        .FontColor(Colors.Grey.Darken3);


                        col.Item()
                        .Text("ORDEM DE SERVIÇO")
                        .FontSize(12)
                        .FontColor(Colors.Grey.Darken1);
                    });


                    row.ConstantItem(150)
                    .AlignRight()
                    .Column(col =>
                    {
                        col.Item()
                        .Text("OS Nº")
                        .FontSize(10)
                        .FontColor(Colors.Grey.Darken1);


                        col.Item()
                        .Text(os.Id.ToString()[..8].ToUpper())
                        .FontSize(18)
                        .Bold();
                    });
                });



                page.Content()
                .PaddingVertical(15)
                .Column(column =>
                {
                    column.Spacing(15);



                    column.Item()
                    .Row(row =>
                    {
                        row.RelativeItem()
                        .Text($"Data: {os.DataCriacao:dd/MM/yyyy}")
                        .Bold();


                        row.RelativeItem()
                        .AlignRight()
                        .Text($"Status: {os.Status}")
                        .Bold();
                    });



                    column.Item()
                    .LineHorizontal(1);



                    column.Item()
                    .Background(Colors.Grey.Lighten4)
                    .Padding(12)
                    .Column(cliente =>
                    {
                        cliente.Item()
                        .Text("CLIENTE")
                        .Bold()
                        .FontSize(14)
                        .FontColor(Colors.Grey.Darken2);


                        cliente.Item()
                        .Text($"Nome: {os.Cliente.Nome}");


                        cliente.Item()
                        .Text($"Telefone: {os.Cliente.Telefone}");
                    });



                    column.Item()
                    .Background(Colors.Grey.Lighten4)
                    .Padding(12)
                    .Column(veiculo =>
                    {
                        veiculo.Item()
                        .Text("VEÍCULO")
                        .Bold()
                        .FontSize(14)
                        .FontColor(Colors.Grey.Darken2);


                        veiculo.Item()
                        .Text($"Modelo: {os.Veiculo.Modelo}");


                        veiculo.Item()
                        .Text($"Placa: {os.Veiculo.Placa}");


                        veiculo.Item()
                        .Text($"Ano: {os.Veiculo.Ano}");
                    });



                    column.Item()
                    .Background(Colors.Grey.Lighten4)
                    .Padding(12)
                    .Column(servico =>
                    {
                        servico.Item()
                        .Text("SERVIÇO")
                        .Bold()
                        .FontSize(14)
                        .FontColor(Colors.Grey.Darken2);


                        servico.Item()
                        .PaddingTop(5)
                        .Text(os.Descricao);



                        servico.Item()
                        .PaddingTop(15)
                        .Text("MÃO DE OBRA")
                        .Bold();


                        servico.Item()
                        .Text($"R$ {os.ValorMaoObra:F2}");



                        if (os.Itens.Any())
                        {
                            servico.Item()
                            .PaddingTop(15)
                            .Text("PEÇAS / MATERIAIS")
                            .Bold();



                            foreach (var item in os.Itens)
                            {
                                servico.Item()
                                .PaddingTop(5)
                                .Text(
                                    $"{item.Descricao} - " +
                                    $"{item.Quantidade}x - " +
                                    $"R$ {item.ValorTotal:F2}"
                                );
                            }
                        }



                        servico.Item()
                        .PaddingTop(20)
                        .LineHorizontal(1);



                        servico.Item()
                        .PaddingTop(10)
                        .Text("TOTAL DA ORDEM DE SERVIÇO")
                        .Bold()
                        .FontSize(14);



                        servico.Item()
                        .Text($"R$ {os.ValorTotal:F2}")
                        .Bold()
                        .FontSize(18);
                    });



                    column.Item()
                    .PaddingTop(10)
                    .Background(Colors.Grey.Lighten3)
                    .Padding(12)
                    .Column(obs =>
                    {
                        obs.Item()
                        .Text("OBSERVAÇÕES")
                        .Bold();


                        obs.Item()
                        .PaddingTop(5)
                        .Text(
                            "Agradecemos a preferência. " +
                            "Estamos sempre à disposição para cuidar do seu veículo."
                        );
                    });



                    column.Item()
                    .PaddingTop(35)
                    .Row(row =>
                    {
                        row.RelativeItem()
                        .Column(assinatura =>
                        {
                            assinatura.Item()
                            .LineHorizontal(1);


                            assinatura.Item()
                            .AlignCenter()
                            .Text("Cliente")
                            .FontSize(10);
                        });


                        row.ConstantItem(40);



                        row.RelativeItem()
                        .Column(assinatura =>
                        {
                            assinatura.Item()
                            .LineHorizontal(1);


                            assinatura.Item()
                            .AlignCenter()
                            .Text("Responsável Oficina")
                            .FontSize(10);
                        });
                    });

                });



                page.Footer()
                .PaddingTop(15)
                .Column(footer =>
                {
                    footer.Item()
                    .AlignCenter()
                    .Text("Obrigado pela preferência!")
                    .Bold();


                    footer.Item()
                    .AlignCenter()
                    .Text(
                        "Entre em contato conosco pelo WhatsApp."
                    )
                    .FontSize(10)
                    .FontColor(Colors.Grey.Darken1);



                    footer.Item()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span($"{os.Cliente.Oficina.Nome} • Página ");
                        text.CurrentPageNumber();
                    });
                });

            });

        }).GeneratePdf();
    }
}