using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Application.Exceptions;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Infrastructure.Data;
using OficinaMecanica.Infrastructure.Repositories;
using Xunit;

namespace OficinaMecanica.Tests;

/// <summary>
/// Regras de autorização de OS por mecânico, exercitadas na camada de serviço
/// com banco em memória (mesmas classes usadas em produção).
/// </summary>
public class OrdemServicoAcessoServiceTests
{
    private readonly OficinaDbContext _db;
    private readonly SeedIds _ids;
    private readonly OrdemServicoAppService _service;

    public OrdemServicoAcessoServiceTests()
    {
        var options = new DbContextOptionsBuilder<OficinaDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _db = new OficinaDbContext(options);
        _ids = TestSeed.Popular(_db);

        var mecanicoRepo = new MecanicoRepository(_db);

        _service = new OrdemServicoAppService(
            new OrdemServicoRepository(_db),
            new ClienteRepository(_db),
            new VeiculoRepository(_db),
            new HistoricoOrdemServicoRepository(_db),
            mecanicoRepo,
            new OficinaRepository(_db),
            new PecasRepository(_db),
            new MovimentacaoEstoqueRepository(_db),
            new EscopoMecanicoService(mecanicoRepo));
    }

    private CriarOrdemServicoDto NovaOs(Guid mecanicoId) => new()
    {
        ClienteId = _ids.ClienteId,
        VeiculoId = _ids.VeiculoId,
        MecanicoId = mecanicoId,
        Descricao = "Troca de oleo",
        ValorMaoObra = 80m
    };

    // 1. Mecânico acessa a própria OS
    [Fact]
    public async Task Mecanico_ConsultaPropriaOs()
    {
        var os = await _service.ObterPorIdAsync(_ids.MecAUserId, _ids.OsAId);

        Assert.NotNull(os);
        Assert.Equal(_ids.MecAId, os!.MecanicoId);
    }

    [Fact]
    public async Task Mecanico_Listagem_RetornaTodasAsOsDaOficina()
    {
        var lista = await _service.ListarAsync(_ids.MecAUserId);

        Assert.Contains(lista, o => o.Id == _ids.OsAId);
        Assert.Contains(lista, o => o.Id == _ids.OsBId);
    }

    // 2. Mecânico CONSULTA OS de outro mecânico (ex.: cliente liga perguntando do andamento)
    [Fact]
    public async Task Mecanico_ConsultaOsDeOutroMecanico()
    {
        var os = await _service.ObterPorIdAsync(_ids.MecAUserId, _ids.OsBId);
        Assert.NotNull(os);
        Assert.Equal(_ids.MecBId, os!.MecanicoId);

        Assert.NotNull(await _service.ObterEntidadePorIdAsync(_ids.MecAUserId, _ids.OsBId));
        Assert.NotNull(await _service.ObterHistoricoAsync(_ids.MecAUserId, _ids.OsBId));
    }

    [Fact]
    public async Task Mecanico_NaoUsaAcaoDeWhatsAppEmOsDeOutroMecanico()
    {
        await Assert.ThrowsAsync<AcessoNegadoException>(
            () => _service.ObterEntidadePorIdAsync(_ids.MecAUserId, _ids.OsBId, exigirResponsavel: true));
    }

    [Fact]
    public async Task Mecanico_NaoExecutaAcoesEmOsDeOutroMecanico()
    {
        var alvo = _ids.OsBId;
        var u = _ids.MecAUserId;

        await Assert.ThrowsAsync<AcessoNegadoException>(() => _service.EnviarParaAprovacaoAsync(u, alvo));
        await Assert.ThrowsAsync<AcessoNegadoException>(() => _service.AprovarAsync(u, alvo));
        await Assert.ThrowsAsync<AcessoNegadoException>(() => _service.RecusarAsync(u, alvo));
        await Assert.ThrowsAsync<AcessoNegadoException>(() => _service.ConcluirAsync(u, alvo));
        await Assert.ThrowsAsync<AcessoNegadoException>(() => _service.CancelarAsync(u, alvo, "motivo"));
        await Assert.ThrowsAsync<AcessoNegadoException>(() => _service.ReabrirAsync(u, alvo, "motivo"));
        await Assert.ThrowsAsync<AcessoNegadoException>(() =>
            _service.AdicionarItemAsync(u, alvo, new OrdemServicoItemDto { Descricao = "x", Quantidade = 1, ValorUnitario = 1 }));
        await Assert.ThrowsAsync<AcessoNegadoException>(() =>
            _service.AtualizarItemAsync(u, alvo, Guid.NewGuid(), new OrdemServicoItemDto { Descricao = "x", Quantidade = 1, ValorUnitario = 1 }));
        await Assert.ThrowsAsync<AcessoNegadoException>(() => _service.RemoverItemAsync(u, alvo, Guid.NewGuid()));

        // Nada mudou na OS alheia
        var os = await _db.OrdensServico.AsNoTracking().SingleAsync(o => o.Id == alvo);
        Assert.Equal(Domain.Enums.StatusOrdemServico.Aberta, os.Status);
    }

    // 3. Mecânico não cria OS para outro mecânico
    [Fact]
    public async Task Mecanico_NaoCriaOsParaOutroMecanico()
    {
        var antes = await _db.OrdensServico.CountAsync();

        await Assert.ThrowsAsync<AcessoNegadoException>(
            () => _service.CriarAsync(_ids.MecAUserId, NovaOs(_ids.MecBId)));

        Assert.Equal(antes, await _db.OrdensServico.CountAsync());
    }

    [Fact]
    public async Task Mecanico_CriaOsAtribuidaAEleMesmo()
    {
        var criada = await _service.CriarAsync(_ids.MecAUserId, NovaOs(_ids.MecAId));

        Assert.Equal(_ids.MecAId, criada.MecanicoId);
    }

    [Fact]
    public async Task Mecanico_CriaOsSemInformarMecanico_AtribuiAutomaticamenteAEle()
    {
        var criada = await _service.CriarAsync(_ids.MecAUserId, NovaOs(Guid.Empty));

        Assert.Equal(_ids.MecAId, criada.MecanicoId);
    }

    // 4. Mecânico não altera o responsável pela OS
    [Fact]
    public async Task Mecanico_NaoAlteraResponsavelDaPropriaOs()
    {
        var dto = new AtualizarOrdemServicoDto
        {
            ClienteId = _ids.ClienteId,
            VeiculoId = _ids.VeiculoId,
            MecanicoId = _ids.MecBId,
            Descricao = "tentando repassar",
            ValorMaoObra = 10m
        };

        await Assert.ThrowsAsync<AcessoNegadoException>(
            () => _service.AtualizarAsync(_ids.MecAUserId, _ids.OsAId, dto));

        var os = await _db.OrdensServico.AsNoTracking().SingleAsync(o => o.Id == _ids.OsAId);
        Assert.Equal(_ids.MecAId, os.MecanicoId);
        Assert.Equal("OS do mecanico A", os.Descricao);
    }

    [Fact]
    public async Task Mecanico_NaoEditaOsDeOutroMecanico()
    {
        var dto = new AtualizarOrdemServicoDto
        {
            ClienteId = _ids.ClienteId,
            VeiculoId = _ids.VeiculoId,
            MecanicoId = _ids.MecAId,
            Descricao = "roubando a OS",
            ValorMaoObra = 10m
        };

        await Assert.ThrowsAsync<AcessoNegadoException>(
            () => _service.AtualizarAsync(_ids.MecAUserId, _ids.OsBId, dto));

        var os = await _db.OrdensServico.AsNoTracking().SingleAsync(o => o.Id == _ids.OsBId);
        Assert.Equal(_ids.MecBId, os.MecanicoId);
    }

    // Casos de integridade
    [Fact]
    public async Task OsInexistente_LancaNaoEncontrado_ParaAcoes_ENullParaConsulta()
    {
        var inexistente = Guid.NewGuid();

        Assert.Null(await _service.ObterPorIdAsync(_ids.MecAUserId, inexistente));
        await Assert.ThrowsAsync<NaoEncontradoException>(() => _service.AprovarAsync(_ids.MecAUserId, inexistente));
        await Assert.ThrowsAsync<NaoEncontradoException>(() => _service.ObterHistoricoAsync(_ids.AdminUserId, inexistente));
    }

    [Fact]
    public async Task UsuarioSemVinculo_MecanicoInativo_UsuarioInativo_SaoNegados()
    {
        await Assert.ThrowsAsync<AcessoNegadoException>(() => _service.ListarAsync(_ids.SemVinculoUserId));
        await Assert.ThrowsAsync<AcessoNegadoException>(() => _service.ListarAsync(_ids.MecInativoUserId));
        await Assert.ThrowsAsync<AcessoNegadoException>(() => _service.ListarAsync(_ids.UsuarioInativoId));
        await Assert.ThrowsAsync<AcessoNegadoException>(() => _service.ListarAsync(int.MaxValue)); // usuário inexistente
    }

    // 6. Serviço continua funcionando após tentativa indevida
    [Fact]
    public async Task AposTentativaIndevida_ServicoContinuaFuncionando()
    {
        await Assert.ThrowsAsync<AcessoNegadoException>(
            () => _service.AprovarAsync(_ids.MecAUserId, _ids.OsBId));

        var propria = await _service.ObterPorIdAsync(_ids.MecAUserId, _ids.OsAId);
        var lista = await _service.ListarAsync(_ids.MecAUserId);

        Assert.NotNull(propria);
        Assert.NotEmpty(lista);
    }

    // 8. Administrador mantém as permissões
    [Fact]
    public async Task Admin_ListaEConsultaTodasAsOs()
    {
        var lista = await _service.ListarAsync(_ids.AdminUserId);

        Assert.Contains(lista, o => o.Id == _ids.OsAId);
        Assert.Contains(lista, o => o.Id == _ids.OsBId);
        Assert.NotNull(await _service.ObterPorIdAsync(_ids.AdminUserId, _ids.OsBId));
    }

    [Fact]
    public async Task Admin_CriaOsParaQualquerMecanico_ETrocaResponsavel()
    {
        var criada = await _service.CriarAsync(_ids.AdminUserId, NovaOs(_ids.MecBId));
        Assert.Equal(_ids.MecBId, criada.MecanicoId);

        await _service.AtualizarAsync(_ids.AdminUserId, _ids.OsParaAdminEditarId, new AtualizarOrdemServicoDto
        {
            ClienteId = _ids.ClienteId,
            VeiculoId = _ids.VeiculoId,
            MecanicoId = _ids.MecAId,
            Descricao = "reatribuida pelo admin",
            ValorMaoObra = 60m
        });

        var os = await _db.OrdensServico.AsNoTracking().SingleAsync(o => o.Id == _ids.OsParaAdminEditarId);
        Assert.Equal(_ids.MecAId, os.MecanicoId);
    }

    [Fact]
    public async Task Admin_AindaExecutaTransicoesEmOsDeQualquerMecanico()
    {
        await _service.EnviarParaAprovacaoAsync(_ids.AdminUserId, _ids.OsBId);

        var os = await _db.OrdensServico.AsNoTracking().SingleAsync(o => o.Id == _ids.OsBId);
        Assert.Equal(Domain.Enums.StatusOrdemServico.AguardandoAprovacao, os.Status);
    }
}
