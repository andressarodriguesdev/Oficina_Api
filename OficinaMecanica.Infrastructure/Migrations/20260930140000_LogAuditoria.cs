using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using OficinaMecanica.Infrastructure.Data;

#nullable disable

namespace OficinaMecanica.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(OficinaDbContext))]
    [Migration("20260930140000_LogAuditoria")]
    public partial class LogAuditoria : Migration
    {
        /// <summary>Tabela de auditoria de cadastros (quem criou/alterou/inativou/excluiu).</summary>
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
CREATE TABLE IF NOT EXISTS ""LogsAuditoria"" (
    ""Id"" uuid NOT NULL,
    ""OficinaId"" uuid NULL,
    ""UsuarioId"" integer NULL,
    ""UsuarioNome"" text NULL,
    ""Acao"" text NOT NULL,
    ""Entidade"" text NOT NULL,
    ""EntidadeId"" uuid NOT NULL,
    ""Descricao"" text NULL,
    ""CriadoEm"" timestamp with time zone NOT NULL,
    CONSTRAINT ""PK_LogsAuditoria"" PRIMARY KEY (""Id"")
);
CREATE INDEX IF NOT EXISTS ""IX_LogsAuditoria_Entidade_EntidadeId""
    ON ""LogsAuditoria"" (""Entidade"", ""EntidadeId"");");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"DROP TABLE IF EXISTS ""LogsAuditoria"";");
        }
    }
}
