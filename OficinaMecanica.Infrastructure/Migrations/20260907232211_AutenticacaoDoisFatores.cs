using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OficinaMecanica.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AutenticacaoDoisFatores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TwoFactorAttempts",
                table: "Usuario",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "TwoFactorCodeExpiresAt",
                table: "Usuario",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwoFactorCodeHash",
                table: "Usuario",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "TwoFactorEnabled",
                table: "Usuario",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TwoFactorAttempts",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "TwoFactorCodeExpiresAt",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "TwoFactorCodeHash",
                table: "Usuario");

            migrationBuilder.DropColumn(
                name: "TwoFactorEnabled",
                table: "Usuario");
        }
    }
}
