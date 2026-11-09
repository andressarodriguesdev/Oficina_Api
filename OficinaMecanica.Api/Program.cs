using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using OficinaMecanica.Api.Configurations;
using OficinaMecanica.Api.Services;
using OficinaMecanica.Application.Exceptions;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Infrastructure.Data;
using OficinaMecanica.Infrastructure.Repositories;
using OficinaMecanica.Infrastructure.Services;
using QuestPDF.Infrastructure;
using Resend;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// Segredos obrigatórios: falha na inicialização com mensagem clara (nada de valores padrão inseguros)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException(
        "ConnectionStrings:DefaultConnection não configurada. " +
        "Defina a variável de ambiente ConnectionStrings__DefaultConnection " +
        "(ou o appsettings.Development.json local).");

var jwtConfigurado = builder.Configuration.GetSection("Jwt").Get<JwtSettings>();

if (jwtConfigurado == null ||
    string.IsNullOrWhiteSpace(jwtConfigurado.Key) ||
    jwtConfigurado.Key.Length < 32)
    throw new InvalidOperationException(
        "Jwt:Key não configurada ou curta demais (mínimo de 32 caracteres). " +
        "Defina a variável de ambiente Jwt__Key.");

// CORS: em produção informe as origens do frontend em Cors:AllowedOrigins
var origensPermitidas = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        if (origensPermitidas.Length > 0)
        {
            policy
                .WithOrigins(origensPermitidas)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
        else
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

// Atrás de proxy (Render, Azure, etc.) o IP real do cliente vem em X-Forwarded-For
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

// Limite de tentativas nas rotas de autenticação (força bruta)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            httpContext.Connection.RemoteIpAddress?.ToString() ?? "desconhecido",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.OnRejected = async (contexto, cancellationToken) =>
    {
        contexto.HttpContext.Response.ContentType = "application/json";

        await contexto.HttpContext.Response.WriteAsJsonAsync(
            new
            {
                mensagem =
                    "Muitas tentativas. Aguarde um minuto e tente novamente."
            },
            cancellationToken);
    };
});

// Serviços
builder.Services
    .AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Erros de validação no mesmo formato dos demais erros da API
        options.InvalidModelStateResponseFactory = contexto =>
        {
            var mensagem = contexto.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .FirstOrDefault(m => !string.IsNullOrWhiteSpace(m))
                ?? "Dados inválidos.";

            return new BadRequestObjectResult(new { mensagem });
        };
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Digite: Bearer {seu token JWT}"
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecuritySchemeReference(
                    "Bearer",
                    document
                ),
                new List<string>()
            }
        });
});

builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("Jwt")
);

builder.Services.AddSingleton(sp =>
    sp.GetRequiredService<
        Microsoft.Extensions.Options.IOptions<JwtSettings>
    >().Value
);

builder.Services.AddMemoryCache();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUsuarioAtualProvider, UsuarioAtualProvider>();

builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<TwoFactorService>();
builder.Services.AddScoped<ResendEmailService>();

builder.Services
    .AddOptions<ResendClientOptions>()
    .Bind(builder.Configuration.GetSection("Resend"));

builder.Services.AddHttpClient<ResendClient>();

// Banco de dados
builder.Services.AddDbContext<OficinaDbContext>(options =>
    options.UseNpgsql(connectionString)
);

// Injeção de dependência
builder.Services.AddScoped<ClienteRepository>();
builder.Services.AddScoped<ClienteAppService>();

builder.Services.AddScoped<VeiculoRepository>();
builder.Services.AddScoped<VeiculoAppService>();

builder.Services.AddScoped<EscopoMecanicoService>();
builder.Services.AddScoped<OrdemServicoRepository>();
builder.Services.AddScoped<OrdemServicoAppService>();

builder.Services.AddScoped<HistoricoOrdemServicoRepository>();

builder.Services.AddScoped<OficinaRepository>();
builder.Services.AddScoped<OficinaAppService>();

builder.Services.AddScoped<OrdemServicoPdfService>();
builder.Services.AddScoped<WhatsAppService>();

builder.Services.AddScoped<FinanceiroAppService>();

builder.Services.AddScoped<MecanicoRepository>();
builder.Services.AddScoped<MecanicoAppService>();

builder.Services.AddScoped<PecasRepository>();
builder.Services.AddScoped<PecasAppService>();
builder.Services.AddScoped<MovimentacaoEstoqueRepository>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtSettings = builder.Configuration
            .GetSection("Jwt")
            .Get<JwtSettings>();

        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ClockSkew = TimeSpan.FromMinutes(1),

                ValidIssuer = jwtSettings!.Issuer,
                ValidAudience = jwtSettings.Audience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtSettings.Key
                        )
                    )
            };

        // A cada requisição: usuário precisa existir e estar ativo, e o perfil
        // vem do banco (rebaixar/desativar vale na hora, sem esperar o token expirar)
        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async contexto =>
            {
                var valorId = contexto.Principal?
                    .FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (!int.TryParse(valorId, out var usuarioId))
                {
                    contexto.Fail("Token sem identificação de usuário.");
                    return;
                }

                var db = contexto.HttpContext.RequestServices
                    .GetRequiredService<OficinaDbContext>();

                var usuario = await db.Usuario
                    .AsNoTracking()
                    .Where(u => u.Id == usuarioId)
                    .Select(u => new { u.Ativo, u.Perfil })
                    .FirstOrDefaultAsync(contexto.HttpContext.RequestAborted);

                if (usuario == null || !usuario.Ativo)
                {
                    contexto.Fail("Usuário inválido ou inativo.");
                    return;
                }

                if (contexto.Principal?.Identity is ClaimsIdentity identidade)
                {
                    foreach (var claim in identidade.FindAll(ClaimTypes.Role).ToList())
                        identidade.RemoveClaim(claim);

                    identidade.AddClaim(
                        new Claim(ClaimTypes.Role, usuario.Perfil.ToString()));
                }
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// ============================================================
// TRATAMENTO GLOBAL DE EXCEÇÕES
// ============================================================

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandler =
            context.Features.Get<IExceptionHandlerFeature>();

        var exception = exceptionHandler?.Error;

        if (exception is AcessoNegadoException)
        {
            context.Response.StatusCode =
                StatusCodes.Status403Forbidden;

            await context.Response.WriteAsJsonAsync(
                new
                {
                    mensagem = exception.Message
                }
            );

            return;
        }

        if (exception is NaoEncontradoException)
        {
            context.Response.StatusCode =
                StatusCodes.Status404NotFound;

            await context.Response.WriteAsJsonAsync(
                new
                {
                    mensagem = exception.Message
                }
            );

            return;
        }

        if (exception is UnauthorizedAccessException)
        {
            context.Response.StatusCode =
                StatusCodes.Status401Unauthorized;

            await context.Response.WriteAsJsonAsync(
                new
                {
                    mensagem = "Autenticação inválida ou expirada."
                }
            );

            return;
        }

        if (exception is RegraNegocioException)
        {
            context.Response.StatusCode =
                StatusCodes.Status400BadRequest;

            context.Response.ContentType =
                "application/json";

            await context.Response.WriteAsJsonAsync(
                new
                {
                    mensagem = exception.Message
                }
            );

            return;
        }

        // Erros inesperados precisam aparecer no log (antes eram engolidos)
        context.RequestServices
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger("ExceptionHandler")
            .LogError(
                exception,
                "Erro não tratado em {Method} {Path}",
                context.Request.Method,
                context.Request.Path);

        context.Response.StatusCode =
            StatusCodes.Status500InternalServerError;

        context.Response.ContentType =
            "application/json";

        await context.Response.WriteAsJsonAsync(
            new
            {
                mensagem =
                    "Ocorreu um erro interno no servidor."
            }
        );
    });
});

// Pipeline
app.UseForwardedHeaders();

if (origensPermitidas.Length == 0 && !app.Environment.IsDevelopment())
    app.Logger.LogWarning(
        "Cors:AllowedOrigins não configurado: aceitando qualquer origem. " +
        "Em produção, informe a URL do frontend.");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseRateLimiter();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

// Verificação de saúde (uso do provedor de hospedagem / monitoramento)
app.MapGet("/health", async (OficinaDbContext db, CancellationToken ct) =>
{
    try
    {
        return await db.Database.CanConnectAsync(ct)
            ? Results.Ok(new { status = "ok" })
            : Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
    }
    catch
    {
        return Results.StatusCode(StatusCodes.Status503ServiceUnavailable);
    }
}).AllowAnonymous();

app.Run();

// Necessário para os testes de integração (WebApplicationFactory<Program>)
public partial class Program { }
