namespace OutTheDoor.Api.Domain.Entities;

public class ScenarioTask
{
    public Guid Id { get; set; }
    public Guid ScenarioId { get; set; }

    public string Name { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public int Order { get; set; }
    public bool IsOptional { get; set; }
    public bool IsEnabledByDefault { get; set; }

    public Scenario? Scenario { get; set; }
}
