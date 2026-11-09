using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using OficinaMecanica.Application.DTOs;
using OficinaMecanica.Domain.Entities;
using OficinaMecanica.Infrastructure.Data;
using Xunit;

namespace OficinaMecanica.Tests;

/// <summary>Contrato HTTP do controle de acesso de mecânicos às OS.</summary>
public class OrdemServicoApiAcessoTests : IDisposable
{
    private const string MensagemEsperada = "Você só pode acessar ordens de serviço atribuídas a você.";

    // Uma factory (e portanto um banco em memória + seed) por teste:
    // o xUnit cria uma nova instância da classe para cada [Fact]/[Theory].
    private readonly ApiFactory _factory = new();
    private SeedIds Ids => _factory.Ids;

    public void Dispose() => _factory.Dispose();

    private HttpClient Mecanico(int usuarioId) => _factory.ClienteAutenticado(usuarioId, PerfilUsuario.Mecanico);
    private HttpClient Admin() => _factory.ClienteAutenticado(Ids.AdminUserId, PerfilUsuario.Admin);

    [Fact]
    public async Task SemToken_Retorna401()
    {
        var resposta = await _factory.CreateClient().GetAsync("/api/ordens-servico");

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Mecanico_ConsultaPropriaOs_Retorna200()
    {
        var resposta = await Mecanico(Ids.MecAUserId).GetAsync($"/api/ordens-servico/{Ids.OsAId}");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
    }

    [Fact]
    public async Task Mecanico_Listagem_RetornaTodasAsOsDaOficina()
    {
        var resposta = await Mecanico(Ids.MecAUserId).GetAsync("/api/ordens-servico");
        var lista = await resposta.Content.ReadFromJsonAsync<List<OrdemServicoResponseDto>>();

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.NotNull(lista);
        Assert.Contains(lista!, o => o.Id == Ids.OsAId);
        Assert.Contains(lista!, o => o.Id == Ids.OsBId);
    }

    // Consulta de OS de outro mecânico é liberada (somente leitura)
    [Fact]
    public async Task Mecanico_ConsultaOsDeOutroMecanico_Retorna200()
    {
        var resposta = await Mecanico(Ids.MecAUserId).GetAsync($"/api/ordens-servico/{Ids.OsBId}");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
    }

    [Theory]
    [InlineData("historico")]
    [InlineData("pdf")]
    public async Task Mecanico_ConsultaHistoricoEPdfDeOsAlheia_Retorna200(string sufixo)
    {
        var resposta = await Mecanico(Ids.MecAUserId).GetAsync($"/api/ordens-servico/{Ids.OsBId}/{sufixo}");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
    }

    // O link de aprovação por WhatsApp é uma ação: continua restrito ao responsável
    [Fact]
    public async Task Mecanico_WhatsAppDeOsAlheia_Retorna403ComMensagem()
    {
        var resposta = await Mecanico(Ids.MecAUserId).GetAsync($"/api/ordens-servico/{Ids.OsBId}/whatsapp");
        var corpo = await resposta.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.Forbidden, resposta.StatusCode);
        Assert.Contains(MensagemEsperada, corpo);
    }

    [Fact]
    public async Task Mecanico_AcoesEmOsAlheia_Retornam403_ENaoAlteramOEstado()
    {
        var cliente = Mecanico(Ids.MecAUserId);

        var cancelar = await cliente.PostAsJsonAsync(
            $"/api/ordens-servico/{Ids.OsBId}/cancelar", new CancelarOrdemServicoDto { Motivo = "x" });
        var enviar = await cliente.PostAsync($"/api/ordens-servico/{Ids.OsBId}/enviar-aprovacao", null);
        var item = await cliente.PostAsJsonAsync(
            $"/api/ordens-servico/{Ids.OsBId}/itens",
            new OrdemServicoItemDto { Descricao = "x", Quantidade = 1, ValorUnitario = 1 });

        Assert.Equal(HttpStatusCode.Forbidden, cancelar.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, enviar.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, item.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OficinaDbContext>();
        var os = await db.OrdensServico.AsNoTracking().Include(o => o.Itens).SingleAsync(o => o.Id == Ids.OsBId);
        Assert.Equal(Domain.Enums.StatusOrdemServico.Aberta, os.Status);
        Assert.Empty(os.Itens);
    }

    // 3. Criar OS para outro mecânico
    [Fact]
    public async Task Mecanico_CriaOsParaOutroMecanico_Retorna403_ENaoPersiste()
    {
        var resposta = await Mecanico(Ids.MecAUserId).PostAsJsonAsync("/api/ordens-servico", new CriarOrdemServicoDto
        {
            ClienteId = Ids.ClienteId,
            VeiculoId = Ids.VeiculoId,
            MecanicoId = Ids.MecBId,
            Descricao = "fraude",
            ValorMaoObra = 1m
        });

        Assert.Equal(HttpStatusCode.Forbidden, resposta.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OficinaDbContext>();
        Assert.False(await db.OrdensServico.AnyAsync(o => o.Descricao == "fraude"));
    }

    [Fact]
    public async Task Mecanico_CriaOsParaSiMesmo_Retorna201()
    {
        var resposta = await Mecanico(Ids.MecAUserId).PostAsJsonAsync("/api/ordens-servico", new CriarOrdemServicoDto
        {
            ClienteId = Ids.ClienteId,
            VeiculoId = Ids.VeiculoId,
            MecanicoId = Ids.MecAId,
            Descricao = "minha OS",
            ValorMaoObra = 1m
        });
        var criada = await resposta.Content.ReadFromJsonAsync<OrdemServicoResponseDto>();

        Assert.Equal(HttpStatusCode.Created, resposta.StatusCode);
        Assert.Equal(Ids.MecAId, criada!.MecanicoId);
    }

    // 4. Alterar o responsável
    [Fact]
    public async Task Mecanico_AlteraResponsavelNoPayload_Retorna403_ENaoAltera()
    {
        var resposta = await Mecanico(Ids.MecAUserId).PutAsJsonAsync($"/api/ordens-servico/{Ids.OsAId}", new AtualizarOrdemServicoDto
        {
            ClienteId = Ids.ClienteId,
            VeiculoId = Ids.VeiculoId,
            MecanicoId = Ids.MecBId,
            Descricao = "repassando",
            ValorMaoObra = 1m
        });

        Assert.Equal(HttpStatusCode.Forbidden, resposta.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OficinaDbContext>();
        var os = await db.OrdensServico.AsNoTracking().SingleAsync(o => o.Id == Ids.OsAId);
        Assert.Equal(Ids.MecAId, os.MecanicoId);
    }

    [Fact]
    public async Task OsInexistente_Retorna404()
    {
        var resposta = await Mecanico(Ids.MecAUserId).GetAsync($"/api/ordens-servico/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, resposta.StatusCode);
    }

    [Fact]
    public async Task UsuarioMecanicoSemVinculo_Retorna403_NaoErro500()
    {
        var resposta = await Mecanico(Ids.SemVinculoUserId).GetAsync("/api/ordens-servico");

        Assert.Equal(HttpStatusCode.Forbidden, resposta.StatusCode);
    }

    [Fact]
    public async Task MecanicoInativo_Retorna403()
    {
        var resposta = await Mecanico(Ids.MecInativoUserId).GetAsync("/api/ordens-servico");

        Assert.Equal(HttpStatusCode.Forbidden, resposta.StatusCode);
    }

    // Perfil vem do banco, não do token: token "Admin" de um usuário Mecanico não amplia o acesso
    [Fact]
    public async Task TokenComRoleAdminForjado_NaoAmpliaAcessoDoMecanico()
    {
        var cliente = _factory.ClienteAutenticado(Ids.MecAUserId, PerfilUsuario.Admin);

        var resposta = await cliente.PostAsync($"/api/ordens-servico/{Ids.OsBId}/enviar-aprovacao", null);

        Assert.Equal(HttpStatusCode.Forbidden, resposta.StatusCode);
    }

    // 6. Backend continua de pé
    [Fact]
    public async Task AposAcessoIndevido_ApiContinuaRespondendo()
    {
        var cliente = Mecanico(Ids.MecAUserId);

        var negado = await cliente.PostAsync($"/api/ordens-servico/{Ids.OsBId}/enviar-aprovacao", null);
        var propria = await cliente.GetAsync($"/api/ordens-servico/{Ids.OsAId}");
        var lista = await cliente.GetAsync("/api/ordens-servico");

        Assert.Equal(HttpStatusCode.Forbidden, negado.StatusCode);
        Assert.Equal(HttpStatusCode.OK, propria.StatusCode);
        Assert.Equal(HttpStatusCode.OK, lista.StatusCode);
    }

    // Endpoints alternativos que poderiam revelar dados de outros mecânicos
    // Mecânico consulta produtividade de todos, mas sem OS alheias e sem financeiro
    [Fact]
    public async Task Mecanico_ConsultaIndicadoresDeOutroMecanico_SemOsNemFinanceiro()
    {
        var resposta = await Mecanico(Ids.MecAUserId).GetAsync($"/api/Mecanico/{Ids.MecBId}");
        var corpo = await resposta.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.Contains("\"quantidadeOrdensServico\":2", corpo);
        Assert.Contains("\"totalMaoObra\":0", corpo);
        Assert.Contains("\"ordensServico\":[]", corpo);
    }

    [Fact]
    public async Task Mecanico_ListaTodosOsMecanicos()
    {
        var resposta = await Mecanico(Ids.MecAUserId).GetAsync("/api/Mecanico");
        var corpo = await resposta.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.Contains("Mecanico A", corpo);
        Assert.Contains("Mecanico B", corpo);
    }

    [Fact]
    public async Task Mecanico_NaoAcessaFinanceiro()
    {
        var resposta = await Mecanico(Ids.MecAUserId).GetAsync("/api/financeiro");

        Assert.Equal(HttpStatusCode.Forbidden, resposta.StatusCode);
    }

    // 8. Administrador mantém permissões
    [Fact]
    public async Task Admin_ConsultaOsDeQualquerMecanico_ELista()
    {
        var admin = Admin();

        var os = await admin.GetAsync($"/api/ordens-servico/{Ids.OsBId}");
        var lista = await (await admin.GetAsync("/api/ordens-servico"))
            .Content.ReadFromJsonAsync<List<OrdemServicoResponseDto>>();

        Assert.Equal(HttpStatusCode.OK, os.StatusCode);
        Assert.Contains(lista!, o => o.Id == Ids.OsAId);
        Assert.Contains(lista!, o => o.Id == Ids.OsBId);
    }

    [Fact]
    public async Task Admin_AcessaFinanceiro()
    {
        var resposta = await Admin().GetAsync("/api/financeiro");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
    }

    // Peças/estoque: mecânico só consulta (sem custo); escrita e relatório financeiro só Admin
    [Fact]
    public async Task Mecanico_ConsultaPecasSemVerCusto_ENaoAlteraEstoque()
    {
        var cliente = Mecanico(Ids.MecAUserId);

        var listar = await cliente.GetAsync("/api/pecas");
        var corpo = await listar.Content.ReadAsStringAsync();
        var detalhe = await cliente.GetAsync($"/api/pecas/{Ids.PecaId}");
        var corpoDetalhe = await detalhe.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, listar.StatusCode);
        Assert.Contains("Filtro de oleo", corpo);
        Assert.DoesNotContain("valorCusto", corpo, StringComparison.OrdinalIgnoreCase);
        Assert.Equal(HttpStatusCode.OK, detalhe.StatusCode);
        Assert.DoesNotContain("valorCusto", corpoDetalhe, StringComparison.OrdinalIgnoreCase);

        var ajustar = await cliente.PatchAsJsonAsync(
            $"/api/pecas/{Ids.PecaId}/estoque/ajustar", 999);
        var excluir = await cliente.DeleteAsync($"/api/pecas/{Ids.PecaId}");

        Assert.Equal(HttpStatusCode.Forbidden, ajustar.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, excluir.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OficinaDbContext>();
        var peca = await db.Pecas.AsNoTracking().SingleAsync(p => p.Id == Ids.PecaId);
        Assert.Equal(10, peca.QuantidadeEstoque);
    }

    [Fact]
    public async Task Mecanico_RelatorioDeEstoque_SoComValorDeVenda()
    {
        var resposta = await Mecanico(Ids.MecAUserId).GetAsync("/api/pecas/relatorio-estoque");
        var corpo = await resposta.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        Assert.Contains("Filtro de oleo", corpo);
        Assert.Contains("\"valorVenda\":60", corpo);
        Assert.DoesNotContain("37.5", corpo);
        Assert.Contains("\"valorTotalCusto\":0", corpo);
        Assert.Contains("\"valorTotalVenda\":0", corpo);
    }

    [Fact]
    public async Task Admin_VeCustoDoRelatorioDeEstoque()
    {
        var corpo = await (await Admin().GetAsync("/api/pecas/relatorio-estoque"))
            .Content.ReadAsStringAsync();

        Assert.Contains("37.5", corpo);
    }

    [Fact]
    public async Task Admin_VeCustoDaPeca()
    {
        var corpo = await (await Admin().GetAsync("/api/pecas")).Content.ReadAsStringAsync();

        Assert.Contains("valorCusto", corpo, StringComparison.OrdinalIgnoreCase);
    }

    // Exclusão definitiva e configurações: só Admin
    [Fact]
    public async Task Mecanico_NaoExcluiClienteNemVeiculo_NemAlteraOficina()
    {
        var cliente = Mecanico(Ids.MecAUserId);

        var delCliente = await cliente.DeleteAsync($"/api/clientes/{Ids.ClienteId}");
        var delVeiculo = await cliente.DeleteAsync($"/api/Veiculo/{Ids.VeiculoId}");
        var putOficina = await cliente.PutAsJsonAsync(
            $"/api/oficinas/{Ids.OficinaId}", new { nome = "invadida" });

        Assert.Equal(HttpStatusCode.Forbidden, delCliente.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, delVeiculo.StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, putOficina.StatusCode);
    }

    [Fact]
    public async Task Mecanico_InativaEReativaCliente_PermitidoPeloPerfil()
    {
        var cliente = Mecanico(Ids.MecAUserId);

        var inativar = await cliente.PatchAsync($"/api/clientes/{Ids.ClienteId}/inativar", null);
        var reativar = await cliente.PatchAsync($"/api/clientes/{Ids.ClienteId}/reativar", null);

        Assert.NotEqual(HttpStatusCode.Forbidden, inativar.StatusCode);
        Assert.NotEqual(HttpStatusCode.Forbidden, reativar.StatusCode);
    }

    // Oficina vem do usuário autenticado; endpoints de oficina não são públicos
    [Fact]
    public async Task Oficinas_ExigemAutenticacao_EIsolamPorUsuario()
    {
        var anonimo = _factory.CreateClient();

        Assert.Equal(HttpStatusCode.Unauthorized, (await anonimo.GetAsync("/api/oficinas")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonimo.GetAsync($"/api/oficinas/{Ids.OficinaId}")).StatusCode);

        var mec = Mecanico(Ids.MecAUserId);
        Assert.Equal(HttpStatusCode.OK, (await mec.GetAsync($"/api/oficinas/{Ids.OficinaId}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await mec.GetAsync("/api/oficinas/minha-oficina")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await mec.GetAsync($"/api/oficinas/{Guid.NewGuid()}")).StatusCode);
    }

    // Auditoria: quem executou a ação fica registrado no histórico da OS
    [Fact]
    public async Task HistoricoDaOs_RegistraUsuarioQueExecutouAAcao()
    {
        var mec = Mecanico(Ids.MecAUserId);

        var enviar = await mec.PostAsync($"/api/ordens-servico/{Ids.OsAId}/enviar-aprovacao", null);
        Assert.Equal(HttpStatusCode.NoContent, enviar.StatusCode);

        var historico = await (await mec.GetAsync($"/api/ordens-servico/{Ids.OsAId}/historico"))
            .Content.ReadFromJsonAsync<List<HistoricoOrdemServicoResponseDto>>();

        Assert.NotNull(historico);
        Assert.Contains(historico!, h => h.UsuarioId == Ids.MecAUserId && h.UsuarioNome == "a@teste.com");
    }

    [Fact]
    public async Task Mecanico_AindaConsultaPecasDisponiveisParaOs()
    {
        var resposta = await Mecanico(Ids.MecAUserId)
            .GetAsync($"/api/pecas/disponiveis-ordem-servico?ordemServicoId={Ids.OsAId}");

        Assert.NotEqual(HttpStatusCode.Forbidden, resposta.StatusCode);
        Assert.NotEqual(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    // Criação de acesso do mecânico pelo administrador
    [Fact]
    public async Task Admin_CriaAcessoParaMecanico_ECriaUsuarioComPerfilMecanico()
    {
        var resposta = await Admin().PostAsJsonAsync(
            $"/api/Mecanico/{Ids.MecLivreId}/criar-acesso",
            new { email = "Novo.Mecanico@teste.com", senha = "senha123" });

        Assert.Equal(HttpStatusCode.NoContent, resposta.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OficinaDbContext>();
        var usuario = await db.Usuario.AsNoTracking()
            .SingleAsync(u => u.Email == "novo.mecanico@teste.com");

        Assert.Equal(PerfilAcesso.Mecanico, usuario.Perfil);
        Assert.Equal(Ids.MecLivreId, usuario.MecanicoId);
        Assert.NotEqual("senha123", usuario.SenhaHash);
        Assert.True(usuario.Ativo);
    }

    [Fact]
    public async Task CriarAcesso_Mecanico_Retorna403()
    {
        var resposta = await Mecanico(Ids.MecAUserId).PostAsJsonAsync(
            $"/api/Mecanico/{Ids.MecLivreId}/criar-acesso",
            new { email = "invasor@teste.com", senha = "senha123" });

        Assert.Equal(HttpStatusCode.Forbidden, resposta.StatusCode);
    }

    [Fact]
    public async Task CriarAcesso_EmailDuplicado_MecanicoJaVinculado_OuSenhaCurta_Retornam400()
    {
        var admin = Admin();

        var emailDuplicado = await admin.PostAsJsonAsync(
            $"/api/Mecanico/{Ids.MecLivreId}/criar-acesso",
            new { email = "a@teste.com", senha = "senha123" });
        var jaVinculado = await admin.PostAsJsonAsync(
            $"/api/Mecanico/{Ids.MecAId}/criar-acesso",
            new { email = "outro@teste.com", senha = "senha123" });
        var senhaCurta = await admin.PostAsJsonAsync(
            $"/api/Mecanico/{Ids.MecLivreId}/criar-acesso",
            new { email = "curta@teste.com", senha = "123" });

        Assert.Equal(HttpStatusCode.BadRequest, emailDuplicado.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, jaVinculado.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, senhaCurta.StatusCode);
    }

    // Robustez: validação, saúde e erros com o status certo
    [Fact]
    public async Task ItemComQuantidadeZeroOuValorNegativo_Retorna400_ComMensagem()
    {
        var resposta = await Mecanico(Ids.MecAUserId).PostAsJsonAsync(
            $"/api/ordens-servico/{Ids.OsAId}/itens",
            new OrdemServicoItemDto { Descricao = "x", Quantidade = 0, ValorUnitario = -5 });
        var corpo = await resposta.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
        Assert.Contains("mensagem", corpo);
    }

    [Fact]
    public async Task PecaComValorNegativo_Retorna400()
    {
        var resposta = await Admin().PostAsJsonAsync("/api/pecas", new
        {
            nome = "Peca invalida",
            valorCusto = -1,
            valorVenda = 10,
            quantidadeEstoque = 1,
            estoqueMinimo = 0
        });

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
    }

    [Fact]
    public async Task Health_RespondeSemAutenticacao()
    {
        var resposta = await _factory.CreateClient().GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
    }

    [Fact]
    public async Task ClienteInexistente_AoCriarOs_NaoRetorna500()
    {
        var resposta = await Admin().PostAsJsonAsync("/api/ordens-servico", new CriarOrdemServicoDto
        {
            ClienteId = Guid.NewGuid(),
            VeiculoId = Ids.VeiculoId,
            MecanicoId = Ids.MecAId,
            Descricao = "cliente fantasma",
            ValorMaoObra = 1m
        });

        Assert.True(
            resposta.StatusCode is HttpStatusCode.NotFound or HttpStatusCode.BadRequest,
            $"Esperado 404/400, veio {(int)resposta.StatusCode}");
    }

    [Fact]
    public async Task AjusteManualDeEstoque_RegistraUsuarioNaMovimentacao()
    {
        var ajuste = await Admin().PatchAsJsonAsync($"/api/pecas/{Ids.PecaId}/estoque/ajustar", 15);

        Assert.Equal(HttpStatusCode.OK, ajuste.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OficinaDbContext>();
        var mov = await db.MovimentacoesEstoque.AsNoTracking()
            .FirstAsync(m => m.PecaId == Ids.PecaId && m.UsuarioId == Ids.AdminUserId);

        Assert.Equal("admin@teste.com", mov.UsuarioNome);
    }

    // Usuário desativado perde o acesso na hora, mesmo com token ainda válido
    [Fact]
    public async Task UsuarioDesativado_ComTokenValido_Retorna401()
    {
        var cliente = _factory.ClienteAutenticado(Ids.UsuarioInativoId, PerfilUsuario.Mecanico);

        var resposta = await cliente.GetAsync("/api/ordens-servico");

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    // Bloqueio temporário do login após várias tentativas erradas
    [Fact]
    public async Task Login_AposCincoFalhas_BloqueiaTemporariamente()
    {
        var anonimo = _factory.CreateClient();
        var corpo = new { email = "ninguem@teste.com", senha = "senhaerrada1" };

        for (var i = 0; i < 5; i++)
        {
            var falha = await anonimo.PostAsJsonAsync("/api/Auth/login", corpo);
            Assert.Equal(HttpStatusCode.Unauthorized, falha.StatusCode);
        }

        var bloqueada = await anonimo.PostAsJsonAsync("/api/Auth/login", corpo);

        Assert.Equal(HttpStatusCode.TooManyRequests, bloqueada.StatusCode);
    }

    // Validação de formato
    [Fact]
    public async Task ClienteComEmailOuTelefoneInvalido_Retorna400()
    {
        var resposta = await Admin().PostAsJsonAsync("/api/clientes", new
        {
            nome = "Cliente Novo",
            telefone = "123",
            email = "sem-arroba",
            quantidadeVeiculos = 0
        });

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
    }

    [Fact]
    public async Task VeiculoComPlacaInvalida_Retorna400()
    {
        var resposta = await Admin().PostAsJsonAsync("/api/Veiculo", new
        {
            placa = "12",
            marca = "Fiat",
            modelo = "Uno",
            ano = "2020",
            clienteId = Ids.ClienteId
        });

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
    }

    // Auditoria de cadastros
    [Fact]
    public async Task CadastroDePeca_GeraRegistroDeAuditoriaComUsuario()
    {
        var resposta = await Admin().PostAsJsonAsync("/api/pecas", new
        {
            nome = "Pastilha auditada",
            valorCusto = 10,
            valorVenda = 20,
            quantidadeEstoque = 1,
            estoqueMinimo = 0
        });

        Assert.Equal(HttpStatusCode.Created, resposta.StatusCode);

        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OficinaDbContext>();
        var log = await db.LogsAuditoria.AsNoTracking()
            .FirstAsync(l => l.Entidade == "Peça" && l.Descricao == "Pastilha auditada");

        Assert.Equal("Criado", log.Acao);
        Assert.Equal(Ids.AdminUserId, log.UsuarioId);
        Assert.Equal(Ids.OficinaId, log.OficinaId);
    }

    [Fact]
    public async Task Auditoria_SoParaAdmin()
    {
        var mecanico = await Mecanico(Ids.MecAUserId).GetAsync("/api/auditoria");
        var admin = await Admin().GetAsync("/api/auditoria");

        Assert.Equal(HttpStatusCode.Forbidden, mecanico.StatusCode);
        Assert.Equal(HttpStatusCode.OK, admin.StatusCode);
    }
}