using Microsoft.EntityFrameworkCore;
using OutTheDoor.Api.Domain;

var builder = WebApplication.CreateBuilder(args);

// Connection string: prefer ConnectionStrings:Default, fall back to a bare "Default"
// config key so a plain `Default` environment variable works (Bartender parity).
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? builder.Configuration["Default"];

builder.Services.AddDbContext<OutTheDoorContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddScoped<IOutTheDoorContext>(sp => sp.GetRequiredService<OutTheDoorContext>());

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));

builder.Services.AddControllers();

const string CorsPolicy = "OutTheDoorCors";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
        policy.WithOrigins(
                "http://localhost:4200",
                "http://localhost:4201",
                "http://localhost:8081",
                "https://outthedoor.mattedlabs.com",
                "http://outthedoor.mattedlabs.com")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// Apply migrations on startup so the outthedoor database/schema is created
// automatically on first run against the SQL Server LXC.
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OutTheDoorContext>();
    context.Database.Migrate();
}

app.UseCors(CorsPolicy);
app.MapControllers();

app.Run();
