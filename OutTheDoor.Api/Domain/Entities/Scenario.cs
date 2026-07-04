namespace OutTheDoor.Api.Domain.Entities;

public class Scenario
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    public string Name { get; set; } = string.Empty;
    public string DefaultLeaveTime { get; set; } = "08:00";
    public int BufferMinutes { get; set; }
    public bool AutoStart { get; set; }
    public int[] AlertMinutes { get; set; } = Array.Empty<int>();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public User? User { get; set; }
    public ICollection<ScenarioTask> Tasks { get; set; } = new List<ScenarioTask>();
}
