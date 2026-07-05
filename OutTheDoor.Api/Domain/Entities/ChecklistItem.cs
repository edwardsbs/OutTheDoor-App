namespace OutTheDoor.Api.Domain.Entities;

// A single checklist entry attached to a ScenarioTask (e.g. an item to pack).
// Persisted as JSON on the ScenarioTask row; check state is run-only (client side).
public class ChecklistItem
{
    public string Id { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
}
