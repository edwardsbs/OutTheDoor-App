using OutTheDoor.Api.Domain.Entities;

namespace OutTheDoor.Api.Services.Models;

public static class MappingExtensions
{
    public static ScenarioDto ToDto(this Scenario scenario) => new(
        scenario.Id,
        scenario.Name,
        scenario.DefaultLeaveTime,
        scenario.BufferMinutes,
        scenario.AutoStart,
        scenario.AlertMinutes,
        scenario.Tasks
            .OrderBy(t => t.Order)
            .Select(t => t.ToDto())
            .ToList(),
        scenario.CreatedAt.ToString("o"),
        scenario.UpdatedAt.ToString("o"));

    public static ScenarioTaskDto ToDto(this ScenarioTask task) => new(
        task.Id,
        task.Name,
        task.DurationMinutes,
        task.Order,
        task.IsOptional,
        task.IsEnabledByDefault,
        task.Checklist.Select(c => new ChecklistItemDto(c.Id, c.Text)).ToList(),
        task.Instructions,
        task.Details);

    public static ScenarioTask ToEntity(this ScenarioTaskDto dto, Guid scenarioId) => new()
    {
        Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
        ScenarioId = scenarioId,
        Name = dto.Name,
        DurationMinutes = dto.DurationMinutes,
        Order = dto.Order,
        IsOptional = dto.IsOptional,
        IsEnabledByDefault = dto.IsEnabledByDefault,
        Checklist = (dto.Checklist ?? new List<ChecklistItemDto>())
            .Select(c => new ChecklistItem { Id = c.Id, Text = c.Text })
            .ToList(),
        Instructions = dto.Instructions,
        Details = dto.Details
    };
}
