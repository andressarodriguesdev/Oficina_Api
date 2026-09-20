using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OficinaMecanica.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarDadosCadastroOficina : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Bairro",
                table: "Oficinas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Cep",
                table: "Oficinas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Cidade",
                table: "Oficinas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Cnpj",
                table: "Oficinas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Complemento",
                table: "Oficinas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Oficinas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "InscricaoEstadual",
                table: "Oficinas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Logradouro",
                table: "Oficinas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Numero",
                table: "Oficinas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RazaoSocial",
                table: "Oficinas",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Uf",
                table: "Oficinas",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Bairro",
                table: "Oficinas");

            migrationBuilder.DropColumn(
                name: "Cep",
                table: "Oficinas");

            migrationBuilder.DropColumn(
                name: "Cidade",
                table: "Oficinas");

            migrationBuilder.DropColumn(
                name: "Cnpj",
                table: "Oficinas");

            migrationBuilder.DropColumn(
                name: "Complemento",
                table: "Oficinas");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Oficinas");

            migrationBuilder.DropColumn(
                name: "InscricaoEstadual",
                table: "Oficinas");

            migrationBuilder.DropColumn(
                name: "Logradouro",
                table: "Oficinas");

            migrationBuilder.DropColumn(
                name: "Numero",
                table: "Oficinas");

            migrationBuilder.DropColumn(
                name: "RazaoSocial",
                table: "Oficinas");

            migrationBuilder.DropColumn(
                name: "Uf",
                table: "Oficinas");
        }
    }
}
