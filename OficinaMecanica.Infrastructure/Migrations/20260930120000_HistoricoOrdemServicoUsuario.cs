using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using OficinaMecanica.Infrastructure.Data;

#nullable disable

namespace OficinaMecanica.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(OficinaDbContext))]
    [Migration("20260930120000_HistoricoOrdemServicoUsuario")]
    public partial class HistoricoOrdemServicoUsuario : Migration
    {
        /// <summary>Auditoria: registra quem executou cada mudança de status da OS.</summary>
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE ""HistoricosOrdemServico"" ADD COLUMN IF NOT EXISTS ""UsuarioId"" integer NULL;
ALTER TABLE ""HistoricosOrdemServico"" ADD COLUMN IF NOT EXISTS ""UsuarioNome"" text NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE ""HistoricosOrdemServico"" DROP COLUMN IF EXISTS ""UsuarioNome"";
ALTER TABLE ""HistoricosOrdemServico"" DROP COLUMN IF EXISTS ""UsuarioId"";");
        }
    }
}
