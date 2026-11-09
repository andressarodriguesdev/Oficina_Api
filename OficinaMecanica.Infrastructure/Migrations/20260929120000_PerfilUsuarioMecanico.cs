using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using OficinaMecanica.Infrastructure.Data;

#nullable disable

namespace OficinaMecanica.Infrastructure.Migrations
{
    /// <inheritdoc />
    [DbContext(typeof(OficinaDbContext))]
    [Migration("20260929120000_PerfilUsuarioMecanico")]
    public partial class PerfilUsuarioMecanico : Migration
    {
        /// <summary>
        /// Idempotente: um ambiente pode já ter Usuario.Perfil (int: 1 = Admin, 2 = Mecanico)
        /// e Usuario.MecanicoId de uma tentativa anterior. Só cria o que faltar e nunca
        /// altera dados existentes.
        /// </summary>
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE ""Usuario"" ADD COLUMN IF NOT EXISTS ""Perfil"" integer NOT NULL DEFAULT 1;
ALTER TABLE ""Usuario"" ADD COLUMN IF NOT EXISTS ""MecanicoId"" uuid NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Usuario_MecanicoId""
    ON ""Usuario"" (""MecanicoId"") WHERE ""MecanicoId"" IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint c
        WHERE c.conrelid = '""Usuario""'::regclass
          AND c.contype = 'f'
          AND c.confrelid = '""Mecanicos""'::regclass) THEN
        ALTER TABLE ""Usuario"" ADD CONSTRAINT ""FK_Usuario_Mecanicos_MecanicoId""
            FOREIGN KEY (""MecanicoId"") REFERENCES ""Mecanicos"" (""Id"") ON DELETE SET NULL;
    END IF;
END $$;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
ALTER TABLE ""Usuario"" DROP CONSTRAINT IF EXISTS ""FK_Usuario_Mecanicos_MecanicoId"";
DROP INDEX IF EXISTS ""IX_Usuario_MecanicoId"";
ALTER TABLE ""Usuario"" DROP COLUMN IF EXISTS ""MecanicoId"";
ALTER TABLE ""Usuario"" DROP COLUMN IF EXISTS ""Perfil"";");
        }
    }
}
