using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OutTheDoor.Api.Domain.Entities;

namespace OutTheDoor.Api.Domain.Configurations;

public class ScenarioTaskConfiguration : IEntityTypeConfiguration<ScenarioTask>
{
    private static readonly JsonSerializerOptions JsonOptions = new();

    public void Configure(EntityTypeBuilder<ScenarioTask> builder)
    {
        builder.ToTable("ScenarioTasks");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedNever();

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        // Checklist persisted as a JSON string column.
        builder.Property(t => t.Checklist)
            .HasConversion(
                v => JsonSerializer.Serialize(v, JsonOptions),
                v => string.IsNullOrEmpty(v)
                    ? new List<ChecklistItem>()
                    : JsonSerializer.Deserialize<List<ChecklistItem>>(v, JsonOptions) ?? new List<ChecklistItem>())
            .Metadata.SetValueComparer(new ValueComparer<List<ChecklistItem>>(
                (a, b) => JsonSerializer.Serialize(a, JsonOptions) == JsonSerializer.Serialize(b, JsonOptions),
                v => JsonSerializer.Serialize(v, JsonOptions).GetHashCode(),
                v => JsonSerializer.Deserialize<List<ChecklistItem>>(JsonSerializer.Serialize(v, JsonOptions), JsonOptions) ?? new List<ChecklistItem>()));

        builder.Property(t => t.Instructions).HasMaxLength(4000);
        builder.Property(t => t.Details).HasMaxLength(4000);
    }
}
