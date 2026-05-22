using DotNetEnv;
using Meteorologico_API.Data;
using Meteorologico_API.Services;
using Microsoft.EntityFrameworkCore;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// 1. Soporte para Controladores y Swagger
// --- VERSIÓN VERIFICADA ESTABLE ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2. Configuración de CORS para el Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 3. Conexión a Supabase (PostgreSQL) — leída del .env via SUPABASE_CONN_STRING
var connectionString = Environment.GetEnvironmentVariable("SUPABASE_CONN_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is missing. Set ConnectionStrings:DefaultConnection or SUPABASE_CONN_STRING.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// 4. Inyección de Dependencias del Agente IA
builder.Services.AddScoped<IAgroAlertAgentService, AgroAlertAgentService>();

var app = builder.Build();

// Configuración del Pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll"); // Aplicar CORS
app.UseAuthorization();
app.MapControllers();

app.Run();