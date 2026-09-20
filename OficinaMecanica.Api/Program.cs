using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
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
using System.Text;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Serviços
builder.Services.AddControllers();

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

builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<TwoFactorService>();
builder.Services.AddScoped<ResendEmailService>();

builder.Services
    .AddOptions<ResendClientOptions>()
    .Bind(builder.Configuration.GetSection("Resend"));

builder.Services.AddHttpClient<ResendClient>();

// Banco de dados
builder.Services.AddDbContext<OficinaDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString(
            "DefaultConnection"
        )
    )
);

// Injeção de dependência
builder.Services.AddScoped<ClienteRepository>();
builder.Services.AddScoped<ClienteAppService>();

builder.Services.AddScoped<VeiculoRepository>();
builder.Services.AddScoped<VeiculoAppService>();

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

                ValidIssuer = jwtSettings!.Issuer,
                ValidAudience = jwtSettings.Audience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            jwtSettings.Key
                        )
                    )
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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();