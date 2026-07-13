using Microsoft.EntityFrameworkCore;
using OficinaMecanica.Application.Services;
using OficinaMecanica.Infrastructure.Data;
using OficinaMecanica.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

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

var app = builder.Build();


// Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();