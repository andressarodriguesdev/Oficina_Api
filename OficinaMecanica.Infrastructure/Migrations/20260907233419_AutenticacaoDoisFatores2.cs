using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OficinaMecanica.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AutenticacaoDoisFatores2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TwoFactorToken",
                table: "Usuario",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TwoFactorTokenExpiresAt",
                table: "Usuario",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TwoFactorToken",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "TwoFactorTokenExpiresAt",
                table: "Usuario");
        }
    }
}
