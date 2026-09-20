
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

        // =========================================================
        // IDENTIDADE VISUAL — OFICINA PRIME
        // =========================================================

        const string primaryColor = "#D7FF3F";
        const string primaryDark = "#101300";

        const string ink = "#151719";
        const string text = "#303438";
        const string muted = "#6B7278";

        const string surface = "#F5F6F3";

        const string border = "#D9DDDF";
        const string borderStrong = "#BFC5C8";

        return Document.Create(container =>
        {
            container.Page(page =>
            {
                // =====================================================
                // CONFIGURAÇÃO DA PÁGINA
                // =====================================================

                page.Size(PageSizes.A4);

                page.MarginHorizontal(34);
                page.MarginVertical(30);

                page.DefaultTextStyle(style =>
                    style
                        .FontFamily("Arial")
                        .FontSize(9.5f)
                        .FontColor(text)
                );

                // =====================================================
                // CABEÇALHO
                // =====================================================

                page.Header()
                    .Column(header =>
                    {
                        header.Item()
                            .Row(row =>
                            {
                                // -------------------------------------
                                // OFICINA
                                // -------------------------------------

                                row.RelativeItem()
                                    .Column(left =>
                                    {
                                        left.Item()
                                            .Text(os.Cliente.Oficina.Nome)
                                            .FontSize(19)
                                            .Bold()
                                            .FontColor(ink);

                                        left.Item()
                                            .PaddingTop(3)
                                            .Text("ORDEM DE SERVIÇO")
                                            .FontSize(8)
                                            .Bold()
                                            .FontColor(muted);
                                    });

                                // -------------------------------------
                                // IDENTIFICAÇÃO DA OS
                                // -------------------------------------

                                row.ConstantItem(145)
                                    .AlignRight()
                                    .Column(right =>
                                    {
                                        right.Item()
                                            .Text("OS")
                                            .FontSize(8)
                                            .Bold()
                                            .FontColor(muted);

                                        right.Item()
                                            .PaddingTop(2)
                                            .Text($"#{os.Id.ToString()[..8].ToUpper()}")
                                            .FontSize(14)
                                            .Bold()
                                            .FontColor(ink);

                                        right.Item()
                                            .PaddingTop(2)
                                            .Text($"Emitida em {os.DataCriacao:dd/MM/yyyy}")
                                            .FontSize(8)
                                            .FontColor(muted);
                                    });
                            });

                        // ---------------------------------------------
                        // LINHA DO CABEÇALHO
                        // ---------------------------------------------

                        header.Item()
                            .PaddingTop(14)
                            .Row(row =>
                            {
                                row.RelativeItem()
                                    .Height(1)
                                    .Background(borderStrong);

                                row.ConstantItem(42)
                                    .Height(3)
                                    .Background(primaryColor);
                            });
                    });

                // =====================================================
                // CONTEÚDO
                // =====================================================

                page.Content()
                    .PaddingTop(20)
                    .Column(column =>
                    {
                        column.Spacing(16);

                        // =================================================
                        // CLIENTE / VEÍCULO / MECÂNICO
                        // =================================================

                        column.Item()
                            .Row(row =>
                            {
                                // -----------------------------------------
                                // CLIENTE
                                // -----------------------------------------

                                row.RelativeItem()
                                    .Background(surface)
                                    .Border(1)
                                    .BorderColor(border)
                                    .Padding(10)
                                    .Column(c =>
                                    {
                                        SectionTitle(
                                            c,
                                            "CLIENTE",
                                            primaryDark
                                        );

                                        c.Item()
                                            .PaddingTop(7)
                                            .Text(os.Cliente.Nome)
                                            .FontSize(10)
                                            .Bold()
                                            .FontColor(ink);

                                        c.Item()
                                            .PaddingTop(4)
                                            .Text(
                                                $"Telefone: {ValueOrDash(os.Cliente.Telefone)}"
                                            )
                                            .FontSize(8.5f)
                                            .FontColor(muted);

                                        c.Item()
                                            .PaddingTop(2)
                                            .Text(
                                                $"E-mail: {ValueOrDash(os.Cliente.Email)}"
                                            )
                                            .FontSize(8.5f)
                                            .FontColor(muted);
                                    });

                                row.ConstantItem(8);

                                // -----------------------------------------
                                // VEÍCULO
                                // -----------------------------------------

                                row.RelativeItem()
                                    .Background(surface)
                                    .Border(1)
                                    .BorderColor(border)
                                    .Padding(10)
                                    .Column(c =>
                                    {
                                        SectionTitle(
                                            c,
                                            "VEÍCULO",
                                            primaryDark
                                        );

                                        c.Item()
                                            .PaddingTop(7)
                                            .Text(
                                                $"{os.Veiculo.Marca} {os.Veiculo.Modelo}"
                                            )
                                            .FontSize(10)
                                            .Bold()
                                            .FontColor(ink);

                                        c.Item()
                                            .PaddingTop(4)
                                            .Text(
                                                $"Placa: {ValueOrDash(os.Veiculo.Placa)}"
                                            )
                                            .FontSize(8.5f)
                                            .FontColor(muted);

                                        c.Item()
                                            .PaddingTop(2)
                                            .Text($"Ano: {os.Veiculo.Ano}")
                                            .FontSize(8.5f)
                                            .FontColor(muted);
                                    });

                                row.ConstantItem(8);

                                // -----------------------------------------
                                // MECÂNICO
                                // -----------------------------------------

                                row.RelativeItem()
                                    .Background(surface)
                                    .Border(1)
                                    .BorderColor(border)
                                    .Padding(10)
                                    .Column(c =>
                                    {
                                        SectionTitle(
                                            c,
                                            "MECÂNICO RESPONSÁVEL",
                                            primaryDark
                                        );

                                        if (os.Mecanico != null)
                                        {
                                            c.Item()
                                                .PaddingTop(7)
                                                .Text(os.Mecanico.Nome)
                                                .FontSize(10)
                                                .Bold()
                                                .FontColor(ink);

                                            c.Item()
                                                .PaddingTop(4)
                                                .Text(
                                                    $"Telefone: {ValueOrDash(os.Mecanico.Telefone)}"
                                                )
                                                .FontSize(8.5f)
                                                .FontColor(muted);

                                            c.Item()
                                                .PaddingTop(2)
                                                .Text(
                                                    $"Especialidade: {ValueOrDash(os.Mecanico.Especialidade)}"
                                                )
                                                .FontSize(8.5f)
                                                .FontColor(muted);
                                        }
                                        else
                                        {
                                            c.Item()
                                                .PaddingTop(7)
                                                .Text("Não informado")
                                                .FontSize(9)
                                                .FontColor(muted);
                                        }
                                    });
                            });

                        // =================================================
                        // DESCRIÇÃO TÉCNICA
                        // =================================================

                        column.Item()
                            .Column(section =>
                            {
                                SectionTitle(
                                    section,
                                    "DESCRIÇÃO TÉCNICA",
                                    primaryDark
                                );

                                section.Item()
                                    .PaddingTop(6)
                                    .Background(Colors.White)
                                    .Border(1)
                                    .BorderColor(border)
                                    .Padding(10)
                                    .Text(
                                        string.IsNullOrWhiteSpace(os.Descricao)
                                            ? "Nenhuma descrição informada."
                                            : os.Descricao
                                    )
                                    .FontSize(9)
                                    .LineHeight(1.35f)
                                    .FontColor(text);
                            });

                        // =================================================
                        // SERVIÇOS E PEÇAS
                        // =================================================

                        column.Item()
                            .Column(section =>
                            {
                                SectionTitle(
                                    section,
                                    "SERVIÇOS E PEÇAS",
                                    primaryDark
                                );

                                section.Item()
                                    .PaddingTop(6)
                                    .Table(table =>
                                    {
                                        table.ColumnsDefinition(columns =>
                                        {
                                            columns.RelativeColumn(3.5f);
                                            columns.RelativeColumn(0.8f);
                                            columns.RelativeColumn(1.3f);
                                            columns.RelativeColumn(1.4f);
                                        });

                                        // ---------------------------------
                                        // CABEÇALHO
                                        // ---------------------------------

                                        table.Header(header =>
                                        {
                                            TableHeaderCell(
                                                header.Cell(),
                                                "ITEM / SERVIÇO",
                                                HorizontalAlignment.Left
                                            );

                                            TableHeaderCell(
                                                header.Cell(),
                                                "QTD",
                                                HorizontalAlignment.Center
                                            );

                                            TableHeaderCell(
                                                header.Cell(),
                                                "VALOR UNIT.",
                                                HorizontalAlignment.Right
                                            );

                                            TableHeaderCell(
                                                header.Cell(),
                                                "TOTAL",
                                                HorizontalAlignment.Right
                                            );
                                        });

                                        // ---------------------------------
                                        // MÃO DE OBRA
                                        // ---------------------------------

                                        TableBodyCell(
                                            table.Cell(),
                                            "Mão de obra",
                                            HorizontalAlignment.Left,
                                            true
                                        );

                                        TableBodyCell(
                                            table.Cell(),
                                            "—",
                                            HorizontalAlignment.Center
                                        );

                                        TableBodyCell(
                                            table.Cell(),
                                            "—",
                                            HorizontalAlignment.Right
                                        );

                                        TableBodyCell(
                                            table.Cell(),
                                            FormatCurrency(os.ValorMaoObra),
                                            HorizontalAlignment.Right,
                                            true
                                        );

                                        // ---------------------------------
                                        // PEÇAS / ITENS
                                        // ---------------------------------

                                        foreach (var item in os.Itens)
                                        {
                                            TableBodyCell(
                                                table.Cell(),
                                                item.Descricao,
                                                HorizontalAlignment.Left
                                            );

                                            TableBodyCell(
                                                table.Cell(),
                                                item.Quantidade.ToString(),
                                                HorizontalAlignment.Center
                                            );

                                            TableBodyCell(
                                                table.Cell(),
                                                FormatCurrency(item.ValorUnitario),
                                                HorizontalAlignment.Right
                                            );

                                            TableBodyCell(
                                                table.Cell(),
                                                FormatCurrency(item.ValorTotal),
                                                HorizontalAlignment.Right,
                                                true
                                            );
                                        }
                                    });
                            });

                        // =================================================
                        // RESUMO / TOTAL
                        // =================================================

                        column.Item()
                            .PaddingTop(4)
                            .Row(row =>
                            {
                                // -----------------------------------------
                                // OBSERVAÇÕES
                                // -----------------------------------------

                                row.RelativeItem()
                                    .Column(c =>
                                    {
                                        SectionTitle(
                                            c,
                                            "OBSERVAÇÕES",
                                            primaryDark
                                        );

                                        c.Item()
                                            .PaddingTop(6)
                                            .Text(
                                                "Agradecemos a confiança. " +
                                                "Garantia de 90 dias sobre os serviços executados."
                                            )
                                            .FontSize(8.5f)
                                            .LineHeight(1.3f)
                                            .FontColor(muted);
                                    });

                                row.ConstantItem(25);

                                // -----------------------------------------
                                // TOTAL
                                // -----------------------------------------

                                row.ConstantItem(190)
                                    .Background(surface)
                                    .Border(1)
                                    .BorderColor(border)
                                    .Padding(12)
                                    .Column(c =>
                                    {
                                        c.Item()
                                            .Text("VALOR TOTAL")
                                            .FontSize(8)
                                            .Bold()
                                            .FontColor(muted);

                                        c.Item()
                                            .PaddingTop(4)
                                            .Text(FormatCurrency(os.ValorTotal))
                                            .FontSize(17)
                                            .Bold()
                                            .FontColor(ink);

                                        c.Item()
                                            .PaddingTop(7)
                                            .Height(3)
                                            .Background(primaryColor);
                                    });
                            });

                        // =================================================
                        // ASSINATURAS
                        // =================================================

                        column.Item()
                            .PaddingTop(20)
                            .Row(row =>
                            {
                                Signature(
                                    row.RelativeItem(),
                                    "CLIENTE"
                                );

                                row.ConstantItem(40);

                                Signature(
                                    row.RelativeItem(),
                                    "MECÂNICO RESPONSÁVEL"
                                );
                            });
                    });

                // =====================================================
                // RODAPÉ
                // =====================================================

                page.Footer()
                    .PaddingTop(10)
                    .BorderTop(1)
                    .BorderColor(border)
                    .Row(row =>
                    {
                        row.RelativeItem()
                            .Text(
                                $"{os.Cliente.Oficina.Nome} • Ordem de Serviço"
                            )
                            .FontSize(7)
                            .FontColor(muted);

                        row.ConstantItem(100)
                            .AlignRight()
                            .Text(text =>
                            {
                                text.Span("Página ")
                                    .FontSize(7)
                                    .FontColor(muted);

                                text.CurrentPageNumber()
                                    .FontSize(7)
                                    .FontColor(muted);

                                text.Span(" de ")
                                    .FontSize(7)
                                    .FontColor(muted);

                                text.TotalPages()
                                    .FontSize(7)
                                    .FontColor(muted);
                            });
                    });
            });
        }).GeneratePdf();
    }

    // =============================================================
    // COMPONENTES VISUAIS
    // =============================================================

    private static void SectionTitle(
        ColumnDescriptor column,
        string title,
        string color)
    {
        column.Item()
            .Row(row =>
            {
                row.ConstantItem(4)
                    .Height(12)
                    .Background("#D7FF3F");

                row.ConstantItem(7);

                row.RelativeItem()
                    .AlignMiddle()
                    .Text(title)
                    .FontSize(8)
                    .Bold()
                    .FontColor(color);
            });
    }

    private static void TableHeaderCell(
        IContainer container,
        string text,
        HorizontalAlignment alignment)
    {
        var cell = container
            .Background("#F5F6F3")
            .BorderTop(1)
            .BorderBottom(1)
            .BorderColor("#D9DDDF")
            .PaddingVertical(7)
            .PaddingHorizontal(5);

        if (alignment == HorizontalAlignment.Center)
            cell = cell.AlignCenter();

        if (alignment == HorizontalAlignment.Right)
            cell = cell.AlignRight();

        cell.Text(text)
            .FontSize(7.5f)
            .Bold()
            .FontColor("#6B7278");
    }

    private static void TableBodyCell(
        IContainer container,
        string text,
        HorizontalAlignment alignment,
        bool bold = false)
    {
        var cell = container
            .BorderBottom(0.5f)
            .BorderColor("#E1E4E6")
            .PaddingVertical(8)
            .PaddingHorizontal(5);

        if (alignment == HorizontalAlignment.Center)
            cell = cell.AlignCenter();

        if (alignment == HorizontalAlignment.Right)
            cell = cell.AlignRight();

        var textElement = cell
            .Text(text)
            .FontSize(8.8f)
            .FontColor("#303438");

        if (bold)
            textElement.Bold();
    }

    private static void Signature(
        IContainer container,
        string title)
    {
        container.Column(column =>
        {
            column.Item()
                .PaddingHorizontal(10)
                .LineHorizontal(0.7f)
                .LineColor("#AEB4B8");

            column.Item()
                .PaddingTop(6)
                .AlignCenter()
                .Text(title)
                .FontSize(7.5f)
                .Bold()
                .FontColor("#6B7278");
        });
    }

    // =============================================================
    // FORMATAÇÃO
    // =============================================================

    private static string FormatCurrency(decimal value)
    {
        return $"R$ {value:N2}";
    }

    private static string ValueOrDash(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? "—"
            : value;
    }
}

