using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OficinaMecanica.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Mecanico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "MecanicoId",
                table: "OrdensServico",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Mecanicos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Telefone = table.Column<string>(type: "text", nullable: false),
                    Especialidade = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    OficinaId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Mecanicos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Mecanicos_Oficinas_OficinaId",
                        column: x => x.OficinaId,
                        principalTable: "Oficinas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrdensServico_MecanicoId",
                table: "OrdensServico",
                column: "MecanicoId");

            migrationBuilder.CreateIndex(
                name: "IX_Mecanicos_OficinaId",
                table: "Mecanicos",
                column: "OficinaId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrdensServico_Mecanicos_MecanicoId",
                table: "OrdensServico",
                column: "MecanicoId",
                principalTable: "Mecanicos",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrdensServico_Mecanicos_MecanicoId",
                table: "OrdensServico");

            migrationBuilder.DropTable(
                name: "Mecanicos");

            migrationBuilder.DropIndex(
                name: "IX_OrdensServico_MecanicoId",
                table: "OrdensServico");

            migrationBuilder.DropColumn(
                name: "MecanicoId",
                table: "OrdensServico");
        }
    }
}
