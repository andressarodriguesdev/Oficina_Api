using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using OficinaMecanica.Api.Configurations;
using OficinaMecanica.Infrastructure.Data;

namespace OficinaMecanica.Tests;

/// <summary>API real (pipeline, JWT, controllers, handler de exceções) com banco em memória.</summary>
public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbName = Guid.NewGuid().ToString();
    private SeedIds? _ids;

    /// <summary>Ids do seed. Acessar força a criação do host, que é quem popula o banco.</summary>
    public SeedIds Ids
    {
        get
        {
            _ = Services; // garante que o host (e o seed) já foram criados
            return _ids!;
        }
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // A API exige segredos configurados; nos testes usamos valores próprios
        builder.UseSetting("ConnectionStrings:DefaultConnection", "Host=teste;Database=teste");
        builder.UseSetting("Jwt:Key", "chave-somente-para-testes-com-mais-de-32-caracteres");
        builder.UseSetting("Jwt:Issuer", "OficinaMecanica.API");
        builder.UseSetting("Jwt:Audience", "OficinaMecanica.Client");
        builder.UseSetting("Jwt:ExpirationInMinutes", "60");

        builder.ConfigureServices(services =>
        {
            // Remove o provider real (Npgsql) e todas as configurações de opções registradas por ele
            var remover = services
                .Where(d =>
                    d.ServiceType == typeof(DbContextOptions<OficinaDbContext>) ||
                    d.ServiceType == typeof(DbContextOptions) ||
                    (d.ServiceType.IsGenericType &&
                     d.ServiceType.Name.StartsWith("IDbContextOptionsConfiguration") &&
                     d.ServiceType.GenericTypeArguments[0] == typeof(OficinaDbContext)))
                .ToList();

            foreach (var d in remover)
                services.Remove(d);

            services.AddDbContext<OficinaDbContext>(o => o.UseInMemoryDatabase(_dbName));
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);

        using var scope = host.Services.CreateScope();
        // Atribui ao campo (não à propriedade) para não recursar no getter
        _ids = TestSeed.Popular(scope.ServiceProvider.GetRequiredService<OficinaDbContext>());

        return host;
    }

    /// <summary>JWT válido, assinado com as mesmas configurações da API em teste.</summary>
    public string GerarToken(int usuarioId, string perfil)
    {
        var jwt = Services.GetRequiredService<JwtSettings>();

        var token = new JwtSecurityToken(
            issuer: jwt.Issuer,
            audience: jwt.Audience,
            claims: new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuarioId.ToString()),
                new Claim(ClaimTypes.Role, perfil)
            },
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
                SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public HttpClient ClienteAutenticado(int usuarioId, string perfil)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", GerarToken(usuarioId, perfil));
        return client;
    }
}