using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OutTheDoor.Api.Domain.Entities;

namespace OutTheDoor.Api.Domain.Configurations;

public class ScenarioConfiguration : IEntityTypeConfiguration<Scenario>
{
    public void Configure(EntityTypeBuilder<Scenario> builder)
    {
        builder.ToTable("Scenarios");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedNever();

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.DefaultLeaveTime)
            .IsRequired()
            .HasMaxLength(10);

        // int[] persisted as a comma-separated string.
        var alertMinutesComparer = new ValueComparer<int[]>(
            (a, b) => a != null && b != null && a.SequenceEqual(b),
            v => v.Aggregate(0, (hash, i) => HashCode.Combine(hash, i)),
            v => v.ToArray());

        builder.Property(s => s.AlertMinutes)
            .HasConversion(
                v => string.Join(',', v),
                v => string.IsNullOrEmpty(v)
                    ? Array.Empty<int>()
                    : v.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray())
            .Metadata.SetValueComparer(alertMinutesComparer);
        builder.Property(s => s.AlertMinutes).HasMaxLength(200);

        builder.HasIndex(s => s.UserId);

        builder.HasMany(s => s.Tasks)
            .WithOne(t => t.Scenario!)
            .HasForeignKey(t => t.ScenarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
