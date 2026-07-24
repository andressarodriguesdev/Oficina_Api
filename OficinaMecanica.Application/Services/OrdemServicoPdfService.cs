using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using OficinaMecanica.Domain.Entities;

namespace OficinaMecanica.Infrastructure.Services;

public class OrdemServicoPdfService
{
    public byte[] GerarPdf(OrdemServico os)
    {
        QuestPDF.Settings.License = LicenseType.Community;
        var primaryColor = Colors.Orange.Medium; // Usando o laranja do seu sistema

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Margin(30);
                page.Size(PageSizes.A4);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Grey.Darken3));

                // CABEÇALHO
                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(c =>
                    {
                        c.Item().Text(os.Cliente.Oficina.Nome).FontSize(20).Bold().FontColor(primaryColor);
                        c.Item().Text("ORDEM DE SERVIÇO").FontSize(9).SemiBold();
                    });
                    row.RelativeItem().AlignRight().Column(c =>
                    {
                        c.Item().Text($"OS #{os.Id.ToString()[..8].ToUpper()}").FontSize(14).Bold();
                        c.Item().Text($"Data: {os.DataCriacao:dd/MM/yyyy}");
                    });
                });

                page.Content().PaddingVertical(15).Column(column =>
                {
                    column.Spacing(15);

                    // DADOS DO CLIENTE E VEÍCULO (Blocos com fundo suave e borda no topo)
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c => {
                            c.Item().Text("CLIENTE").FontSize(8).Bold().FontColor(primaryColor);
                            c.Item().Text($"Nome: {os.Cliente.Nome}");
                            c.Item().Text($"Tel: {os.Cliente.Telefone}");
                            c.Item().Text($"Email: {os.Cliente.Email}");
                        });
                        row.ConstantItem(15);
                        row.RelativeItem().Background(Colors.Grey.Lighten4).Padding(10).Column(c => {
                            c.Item().Text("VEÍCULO").FontSize(8).Bold().FontColor(primaryColor);
                            c.Item().Text($"{os.Veiculo.Marca} {os.Veiculo.Modelo}");
                            c.Item().Text($"Placa: {os.Veiculo.Placa} | Ano: {os.Veiculo.Ano}");
                        });
                    });

                    // DESCRIÇÃO
                    column.Item().Column(c => {
                        c.Item().Text("DESCRIÇÃO TÉCNICA").FontSize(8).Bold().FontColor(primaryColor);
                        c.Item().Padding(5).Border(0.5f).BorderColor(Colors.Grey.Lighten2).Text(os.Descricao);
                    });

                    // TABELA
                    column.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns => {
                            columns.RelativeColumn(3); columns.RelativeColumn(1); columns.RelativeColumn(1); columns.RelativeColumn(1);
                        });
                        table.Header(header => {
                            header.Cell().Element(s => s.BorderBottom(1).BorderColor(primaryColor).Padding(5)).Text("Item / Serviço").Bold();
                            header.Cell().Element(s => s.BorderBottom(1).BorderColor(primaryColor).Padding(5)).AlignCenter().Text("Qtd").Bold();
                            header.Cell().Element(s => s.BorderBottom(1).BorderColor(primaryColor).Padding(5)).AlignRight().Text("V. Unit").Bold();
                            header.Cell().Element(s => s.BorderBottom(1).BorderColor(primaryColor).Padding(5)).AlignRight().Text("Total").Bold();
                        });

                        table.Cell().Padding(5).Text("Mão de Obra");
                        table.Cell().Padding(5).AlignCenter().Text("-");
                        table.Cell().Padding(5).AlignRight().Text("-");
                        table.Cell().Padding(5).AlignRight().Text($"R$ {os.ValorMaoObra:F2}");

                        foreach (var item in os.Itens)
                        {
                            table.Cell().Padding(5).Text(item.Descricao);
                            table.Cell().Padding(5).AlignCenter().Text(item.Quantidade.ToString());
                            table.Cell().Padding(5).AlignRight().Text($"R$ {item.ValorUnitario:F2}");
                            table.Cell().Padding(5).AlignRight().Text($"R$ {item.ValorTotal:F2}");
                        }
                    });

                    // RODAPÉ DA PÁGINA (Resumo e Assinaturas)
                    column.Item().PaddingTop(10).Row(row => {
                        row.RelativeItem().Column(c => {
                            c.Item().Text("OBSERVAÇÕES").FontSize(8).Bold().FontColor(primaryColor);
                            c.Item().Text("Agradecemos a confiança. Garantia de 90 dias sobre os serviços executados.");
                        });
                        row.RelativeItem().AlignRight().Column(c => {
                            c.Item().Text("VALOR TOTAL").FontSize(8).Bold();
                            c.Item().Text($"R$ {os.ValorTotal:F2}").FontSize(16).Bold().FontColor(primaryColor);
                        });
                    });

                    column.Item().PaddingTop(30).Row(row => {
                        row.RelativeItem().Column(c => { c.Item().PaddingHorizontal(10).LineHorizontal(0.5f); c.Item().AlignCenter().Text("Assinatura Cliente"); });
                        row.RelativeItem().Column(c => { c.Item().PaddingHorizontal(10).LineHorizontal(0.5f); c.Item().AlignCenter().Text("Responsável"); });
                    });
                });
            });
        }).GeneratePdf();
    }

    // Métodos auxiliares para manter o código limpo
    static IContainer CellStyle(IContainer container) => container.BorderBottom(1).BorderColor(Colors.Orange.Darken2).Padding(5);
    static IContainer CellContent(IContainer container) => container.Padding(5);

}