using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OutTheDoor.Api.Domain.Entities;

namespace OutTheDoor.Api.Domain.Configurations;

public class ScenarioTaskConfiguration : IEntityTypeConfiguration<ScenarioTask>
{
    public void Configure(EntityTypeBuilder<ScenarioTask> builder)
    {
        builder.ToTable("ScenarioTasks");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).ValueGeneratedNever();

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);
    }
}
