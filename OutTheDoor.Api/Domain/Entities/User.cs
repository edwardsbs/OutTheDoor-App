namespace OutTheDoor.Api.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public ICollection<Scenario> Scenarios { get; set; } = new List<Scenario>();
}
