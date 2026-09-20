using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OficinaMecanica.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class VincularPecasOrdemServicoItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PecaId",
                table: "OrdemServicoItens",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrdemServicoItens_PecaId",
                table: "OrdemServicoItens",
                column: "PecaId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrdemServicoItens_Pecas_PecaId",
                table: "OrdemServicoItens",
                column: "PecaId",
                principalTable: "Pecas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrdemServicoItens_Pecas_PecaId",
                table: "OrdemServicoItens");

            migrationBuilder.DropIndex(
                name: "IX_OrdemServicoItens_PecaId",
                table: "OrdemServicoItens");

            migrationBuilder.DropColumn(
                name: "PecaId",
                table: "OrdemServicoItens");
        }
    }
}
