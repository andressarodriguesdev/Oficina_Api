using GarageManager.Api.Authorization;
using GarageManager.Api.Identity;
using GarageManager.Application.Services;
using GarageManager.Domain.Constants;
using GarageManager.Infrastructure.Data;
using GarageManager.Infrastructure.Identity;
using GarageManager.Infrastructure.Repositories;
using GarageManager.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Infrastructure;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// The SPA is served separately for now; it will move under the API in sprint 5. Until
// then the origins it may come from are configuration, never a wildcard — AllowAnyOrigin
// cannot be combined with the credentials the auth cookie needs.
var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<GarageManagerDbContext>(options =>
    options.UseNpgsql(
    builder.Configuration.GetConnectionString("DefaultConnection")
    ));

builder.Services
    .AddIdentityApiEndpoints<ApplicationUser>()
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<GarageManagerDbContext>();

builder.Services.AddAuthorizationBuilder()
    .AddPolicy(Policies.WorkshopStaff, policy =>
        policy.RequireRole(Roles.Proprietor, Roles.Mechanic))
    .AddPolicy(Policies.ProprietorOnly, policy =>
        policy.RequireRole(Roles.Proprietor));

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
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

var auth = app.MapGroup("/api/auth").WithTags("Auth");

// MapIdentityApi ships a public /register. In a dedicated installation accounts are
// handed out by the Proprietor (see UsersController), so the self-service route is
// closed rather than left open to anyone who can reach the host.
auth.AddEndpointFilter(async (context, next) =>
    context.HttpContext.Request.Path.Value?
        .EndsWith("/register", StringComparison.OrdinalIgnoreCase) == true
        ? Results.NotFound()
        : await next(context));

auth.MapIdentityApi<ApplicationUser>();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    await IdentityBootstrap.SeedAsync(
        scope.ServiceProvider,
        app.Configuration,
        app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("IdentityBootstrap"));
}

app.Run();
