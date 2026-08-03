using Microsoft.EntityFrameworkCore;
using GarageManager.Application.Services;
using GarageManager.Infrastructure.Data;
using GarageManager.Infrastructure.Repositories;
using GarageManager.Infrastructure.Services;
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

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<GarageManagerDbContext>(options =>
    options.UseNpgsql(
    builder.Configuration.GetConnectionString("DefaultConnection")
    ));

builder.Services.AddScoped<CustomerRepository>();
builder.Services.AddScoped<CustomerAppService>();
builder.Services.AddScoped<VehicleRepository>();
builder.Services.AddScoped<VehicleAppService>();
builder.Services.AddScoped<JobCardRepository>();
builder.Services.AddScoped<JobCardAppService>();
builder.Services.AddScoped<JobCardStatusChangeRepository>();
builder.Services.AddScoped<WorkshopRepository>();
builder.Services.AddScoped<WorkshopAppService>();
builder.Services.AddScoped<JobCardPdfService>();
builder.Services.AddScoped<WhatsAppService>();
builder.Services.AddScoped<FinanceAppService>();
builder.Services.AddScoped<MechanicRepository>();
builder.Services.AddScoped<MechanicAppService>();
var app = builder.Build();

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
