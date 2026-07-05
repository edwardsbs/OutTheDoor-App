import { Injectable } from '@angular/core';
import { ActiveRun, ActiveRunTask } from '../models/active-run.model';
import { Scenario, ScenarioTask } from '../models/scenario.model';
import { generateId } from '../utils/uuid.util';

@Injectable({ providedIn: 'root' })
export class ScheduleCalculatorService {
  buildRunFromScenario(
    scenario: Scenario,
    leaveDate: Date,
    leaveTime: string,
    quickTasks: ScenarioTask[] = []
  ): ActiveRun {
    const leaveDateTime = this.combineDateAndTime(leaveDate, leaveTime);

    const activeTasks = [...scenario.tasks, ...quickTasks]
      .filter(task => task.isEnabledByDefault)
      .sort((a, b) => a.order - b.order);

    const totalMinutes =
      activeTasks.reduce((sum, task) => sum + task.durationMinutes, 0) + scenario.bufferMinutes;

    const calculatedStartDateTime = new Date(leaveDateTime.getTime() - totalMinutes * 60_000);

    const scheduledTasks = this.buildTaskTimeline(activeTasks, leaveDateTime);

    return {
      id: generateId(),
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      leaveDateTime: leaveDateTime.toISOString(),
      calculatedStartDateTime: calculatedStartDateTime.toISOString(),
      startedAt: undefined,
      endedAt: undefined,
      status: 'pending',
      tasks: scheduledTasks
    };
  }

  recalculateRun(
    run: ActiveRun,
    newLeaveDateTime: Date
  ): { leaveDateTime: string; calculatedStartDateTime: string; tasks: ActiveRunTask[] } {
    const ordered = [...run.tasks].sort((a, b) => a.order - b.order);
    const recalculatedTasks = this.buildTaskTimelineFromActiveTasks(ordered, newLeaveDateTime);

    const remainingDuration = recalculatedTasks
      .filter(task => !task.skippedAt)
      .reduce((sum, task) => sum + task.durationMinutes, 0);

    const calculatedStartDateTime = new Date(newLeaveDateTime.getTime() - remainingDuration * 60_000);

    return {
      leaveDateTime: newLeaveDateTime.toISOString(),
      calculatedStartDateTime: calculatedStartDateTime.toISOString(),
      tasks: recalculatedTasks
    };
  }

  recalculateTaskOrder(
    run: ActiveRun,
    reorderedTasks: ActiveRunTask[]
  ): { calculatedStartDateTime: string; tasks: ActiveRunTask[] } {
    const leaveDateTime = new Date(run.leaveDateTime);
    const normalized = reorderedTasks.map((task, index) => ({
      ...task,
      order: index + 1
    }));

    const tasks = this.buildTaskTimelineFromActiveTasks(normalized, leaveDateTime);

    const remainingDuration = tasks
      .filter(task => !task.skippedAt)
      .reduce((sum, task) => sum + task.durationMinutes, 0);

    const calculatedStartDateTime = new Date(leaveDateTime.getTime() - remainingDuration * 60_000);

    return {
      calculatedStartDateTime: calculatedStartDateTime.toISOString(),
      tasks
    };
  }

  combineDateAndTime(date: Date, time24: string): Date {
    const [hours, minutes] = time24.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  toTimeInputValue(dateIsoString: string): string {
    const date = new Date(dateIsoString);
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private buildTaskTimeline(tasks: ScenarioTask[], leaveDateTime: Date): ActiveRunTask[] {
    let cursor = new Date(leaveDateTime);

    const reversed = [...tasks].sort((a, b) => b.order - a.order);

    const mapped = reversed.map(task => {
      const plannedEnd = new Date(cursor);
      const plannedStart = new Date(plannedEnd.getTime() - task.durationMinutes * 60_000);

      cursor = plannedStart;

      return {
        id: generateId(),
        taskId: task.id,
        name: task.name,
        durationMinutes: task.durationMinutes,
        order: task.order,
        plannedStart: plannedStart.toISOString(),
        plannedEnd: plannedEnd.toISOString(),
        completedAt: undefined,
        skippedAt: undefined,
        isQuickAdd: false,
        checklist: (task.checklist ?? []).map(item => ({
          id: item.id,
          text: item.text,
          checked: false
        })),
        instructions: task.instructions,
        details: task.details
      } satisfies ActiveRunTask;
    });

    return mapped.sort((a, b) => a.order - b.order);
  }

  private buildTaskTimelineFromActiveTasks(tasks: ActiveRunTask[], leaveDateTime: Date): ActiveRunTask[] {
    let cursor = new Date(leaveDateTime);

    const reversed = [...tasks].sort((a, b) => b.order - a.order);

    const mapped = reversed.map(task => {
      const plannedEnd = new Date(cursor);
      const plannedStart = new Date(plannedEnd.getTime() - task.durationMinutes * 60_000);

      cursor = plannedStart;

      return {
        ...task,
        plannedStart: plannedStart.toISOString(),
        plannedEnd: plannedEnd.toISOString()
      };
    });

    return mapped.sort((a, b) => a.order - b.order);
  }
}