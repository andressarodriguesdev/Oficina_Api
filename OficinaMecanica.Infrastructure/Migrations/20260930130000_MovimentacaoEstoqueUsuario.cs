using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using OficinaMecanica.Infrastructure.Data;

#nullable disable

namespace OficinaMecanica.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(OficinaDbContext))]
    [Migration("20260930130000_MovimentacaoEstoqueUsuario")]
    public partial class MovimentacaoEstoqueUsuario : Migration
    {
        /// <summary>Auditoria: registra quem executou cada movimentação de estoque.</summary>
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE ""MovimentacoesEstoque"" ADD COLUMN IF NOT EXISTS ""UsuarioId"" integer NULL;
ALTER TABLE ""MovimentacoesEstoque"" ADD COLUMN IF NOT EXISTS ""UsuarioNome"" text NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE ""MovimentacoesEstoque"" DROP COLUMN IF EXISTS ""UsuarioNome"";
ALTER TABLE ""MovimentacoesEstoque"" DROP COLUMN IF EXISTS ""UsuarioId"";");
        }
    }
}
