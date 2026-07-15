using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Infrastructure.Data;
using OficinaMecanica.Infrastructure.Repositories;
using OficinaMecanica.Infrastructure.Services;
using QuestPDF.Infrastructure;

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
builder.Services.AddSwaggerGen();




// Banco de dados
builder.Services.AddDbContext<OficinaDbContext>(options =>
    options.UseNpgsql(
    builder.Configuration.GetConnectionString("DefaultConnection")
    ));

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
var app = builder.Build();



// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.UseCors("Frontend");
app.MapControllers();
app.Run();

builder.Services.AddCors(options =>

{
    options.AddPolicy("Frontend", policy =>
    {
        policy
        .WithOrigins("http://localhost:5173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod();

    });

});