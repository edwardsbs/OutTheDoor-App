namespace OutTheDoor.Api.Services.Models;

public record ChecklistItemDto(string Id, string Text);

public record ScenarioTaskDto(
    Guid Id,
    string Name,
    int DurationMinutes,
    int Order,
    bool IsOptional,
    bool IsEnabledByDefault,
    IReadOnlyList<ChecklistItemDto>? Checklist = null,
    string? Instructions = null,
    string? Details = null);

public record ScenarioDto(
    Guid Id,
    string Name,
    string DefaultLeaveTime,
    int BufferMinutes,
    bool AutoStart,
    int[] AlertMinutes,
    IReadOnlyList<ScenarioTaskDto> Tasks,
    string CreatedAt,
    string UpdatedAt);
