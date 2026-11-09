using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Tests;

/// <summary>Ids dos registros criados por <see cref="TestSeed.Popular"/>.</summary>
public sealed class SeedIds
{
    public int AdminUserId { get; init; }
    public int MecAUserId { get; init; }
    public int MecBUserId { get; init; }
    public int SemVinculoUserId { get; init; }
    public int MecInativoUserId { get; init; }
    public int UsuarioInativoId { get; init; }

    public Guid MecAId { get; init; }
    public Guid MecBId { get; init; }
    public Guid MecLivreId { get; init; }

    public Guid OficinaId { get; init; }
    public Guid ClienteId { get; init; }
    public Guid VeiculoId { get; init; }
    public Guid PecaId { get; init; }

    public Guid OsAId { get; init; }
    public Guid OsBId { get; init; }
    public Guid OsParaAdminEditarId { get; init; }
}

public static class TestSeed
{
    public static SeedIds Popular(OficinaDbContext db)
    {
        var admin = NovoUsuario("admin@teste.com", PerfilAcesso.Admin, null);
        db.Usuario.Add(admin);
        db.SaveChanges();

        var oficina = new Oficina(
            admin.Id, "Oficina Teste", "Oficina Teste LTDA", "00000000000100", "123",
            "1130000000", "oficina@teste.com", "01001000", "Rua A", "1", "", "Centro",
            "Sao Paulo", "SP", "Rua A, 1");
        db.Oficinas.Add(oficina);

        var mecA = NovoMecanico("Mecanico A", oficina.Id, ativo: true);
        var mecB = NovoMecanico("Mecanico B", oficina.Id, ativo: true);
        var mecInativo = NovoMecanico("Mecanico Inativo", oficina.Id, ativo: false);
        var mecLivre = NovoMecanico("Mecanico Livre", oficina.Id, ativo: true);
        db.Mecanicos.AddRange(mecA, mecB, mecInativo, mecLivre);

        var cliente = new Cliente("Cliente", "11999999999", "cliente@teste.com", oficina.Id);
        db.Clientes.Add(cliente);

        var veiculo = new Veiculo("ABC1D23", "Fiat", "Uno", "2020", cliente.Id, oficina.Id);
        db.Veiculos.Add(veiculo);

        var peca = new Pecas(oficina.Id, "Filtro de oleo", "FO-1", 37.5m, 60m, 10, 2);
        db.Pecas.Add(peca);

        var userA = NovoUsuario("a@teste.com", PerfilAcesso.Mecanico, mecA.Id);
        var userB = NovoUsuario("b@teste.com", PerfilAcesso.Mecanico, mecB.Id);
        var semVinculo = NovoUsuario("semvinculo@teste.com", PerfilAcesso.Mecanico, null);
        var mecInativoUser = NovoUsuario("inativo@teste.com", PerfilAcesso.Mecanico, mecInativo.Id);
        var usuarioInativo = NovoUsuario("usuarioinativo@teste.com", PerfilAcesso.Mecanico, mecA.Id);
        usuarioInativo.Ativo = false;
        usuarioInativo.MecanicoId = null; // evita duplicar o vínculo único de mecA
        db.Usuario.AddRange(userA, userB, semVinculo, mecInativoUser, usuarioInativo);

        var osA = new OrdemServico(oficina.Id, cliente.Id, veiculo.Id, mecA.Id, "OS do mecanico A", 100m);
        var osB = new OrdemServico(oficina.Id, cliente.Id, veiculo.Id, mecB.Id, "OS do mecanico B", 200m);
        var osAdmin = new OrdemServico(oficina.Id, cliente.Id, veiculo.Id, mecB.Id, "OS editada pelo admin", 50m);
        db.OrdensServico.AddRange(osA, osB, osAdmin);

        db.SaveChanges();

        return new SeedIds
        {
            AdminUserId = admin.Id,
            MecAUserId = userA.Id,
            MecBUserId = userB.Id,
            SemVinculoUserId = semVinculo.Id,
            MecInativoUserId = mecInativoUser.Id,
            UsuarioInativoId = usuarioInativo.Id,
            MecAId = mecA.Id,
            MecBId = mecB.Id,
            MecLivreId = mecLivre.Id,
            OficinaId = oficina.Id,
            ClienteId = cliente.Id,
            VeiculoId = veiculo.Id,
            PecaId = peca.Id,
            OsAId = osA.Id,
            OsBId = osB.Id,
            OsParaAdminEditarId = osAdmin.Id
        };
    }

    private static Usuario NovoUsuario(string email, PerfilAcesso perfil, Guid? mecanicoId) => new()
    {
        Nome = email,
        Email = email,
        SenhaHash = "hash",
        Ativo = true,
        EmailVerificado = true,
        Perfil = perfil,
        MecanicoId = mecanicoId
    };

    private static Mecanico NovoMecanico(string nome, Guid oficinaId, bool ativo) => new()
    {
        Id = Guid.NewGuid(),
        Nome = nome,
        Telefone = "11988887777",
        OficinaId = oficinaId,
        Ativo = ativo
    };
}
