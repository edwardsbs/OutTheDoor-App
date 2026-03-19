import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  ActiveRun,
  ActiveRunTask,
  ScheduleHealthSnapshot
} from '../models/active-run.model';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class ActiveRunStore {
  private readonly storage = inject(StorageService);

  readonly activeRun = signal<ActiveRun | null>(null);
  readonly now = signal<Date>(new Date());

  constructor() {
    effect(() => {
      const run = this.activeRun();
      if (run) {
        this.storage.saveActiveRun(run).catch(console.error);
      } else {
        this.storage.clearActiveRun().catch(console.error);
      }
    });
  }

  async load(): Promise<void> {
    const run = await this.storage.getActiveRun();
    this.activeRun.set(run);
  }

  readonly remainingTasks = computed(() =>
    this.activeRun()?.tasks.filter(t => !t.completedAt && !t.skippedAt) ?? []
  );

  readonly completedTasks = computed(() =>
    this.activeRun()?.tasks.filter(t => !!t.completedAt) ?? []
  );

  readonly skippedTasks = computed(() =>
    this.activeRun()?.tasks.filter(t => !!t.skippedAt) ?? []
  );

  readonly totalPlannedMinutes = computed(() =>
    this.activeRun()?.tasks.reduce((sum, task) => sum + task.durationMinutes, 0) ?? 0
  );

  readonly actualCompletedMinutes = computed(() =>
    this.activeRun()?.tasks
      .filter(task => !!task.completedAt)
      .reduce((sum, task) => sum + task.durationMinutes, 0) ?? 0
  );

  readonly plannedCompletedMinutes = computed(() => {
    const run = this.activeRun();
    if (!run) return 0;

    const currentTime = this.now().getTime();

    return run.tasks.reduce((sum, task) => {
      if (task.skippedAt) return sum;

      const start = new Date(task.plannedStart).getTime();
      const end = new Date(task.plannedEnd).getTime();

      if (currentTime <= start) return sum;
      if (currentTime >= end) return sum + task.durationMinutes;

      const elapsed = Math.max(0, currentTime - start);
      const total = Math.max(1, end - start);
      const partialMinutes = Math.round((elapsed / total) * task.durationMinutes);

      return sum + partialMinutes;
    }, 0);
  });

  readonly timeProgressPercent = computed(() => {
    const run = this.activeRun();
    if (!run) return 0;

    const start = new Date(run.calculatedStartDateTime).getTime();
    const end = new Date(run.leaveDateTime).getTime();
    const now = this.now().getTime();

    if (now <= start) return 0;
    if (now >= end) return 100;

    return Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
  });

  readonly resolvedMinutes = computed(() =>
    this.activeRun()?.tasks
      .filter(task => !!task.completedAt || !!task.skippedAt)
      .reduce((sum, task) => sum + task.durationMinutes, 0) ?? 0
  );

  readonly taskProgressPercent = computed(() => {
    const total = this.totalPlannedMinutes();
    if (total <= 0) return 0;

    return Math.max(
      0,
      Math.min(100, Math.round((this.resolvedMinutes() / total) * 100))
    );
  });

  readonly scheduleHealth = computed<ScheduleHealthSnapshot>(() => {
    const run = this.activeRun();
    if (!run) {
      return {
        plannedCompletedMinutes: 0,
        actualCompletedMinutes: 0,
        deltaMinutes: 0,
        health: 'on-schedule'
      };
    }

    const plannedCompletedMinutes = this.plannedCompletedMinutes();
    const actualCompletedMinutes = this.actualCompletedMinutes();
    const deltaMinutes = actualCompletedMinutes - plannedCompletedMinutes;

    let health: ScheduleHealthSnapshot['health'] = 'on-schedule';
    if (deltaMinutes <= -3) health = 'behind';
    else if (deltaMinutes >= 3) health = 'ahead';

    return {
      plannedCompletedMinutes,
      actualCompletedMinutes,
      deltaMinutes,
      health
    };
  });

  setNow(now: Date): void {
    this.now.set(now);
  }

  startRun(run: ActiveRun): void {
    this.activeRun.set(run);
  }

  clearRun(): void {
    this.activeRun.set(null);
  }

  setRunStatus(status: ActiveRun['status']): void {
    this.activeRun.update(run => {
      if (!run) return null;
      return {
        ...run,
        status,
        endedAt:
          status === 'completed' || status === 'cancelled'
            ? new Date().toISOString()
            : run.endedAt
      };
    });
  }

  toggleTaskComplete(taskId: string): void {
    this.activeRun.update(run => {
      if (!run) return null;

      return {
        ...run,
        tasks: run.tasks.map(task => {
          if (task.id !== taskId) return task;

          if (task.completedAt) {
            return {
              ...task,
              completedAt: undefined
            };
          }

          return {
            ...task,
            completedAt: new Date().toISOString(),
            skippedAt: undefined
          };
        })
      };
    });
  }

  skipTask(taskId: string): void {
    this.activeRun.update(run => {
      if (!run) return null;

      return {
        ...run,
        tasks: run.tasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                skippedAt: task.skippedAt ? undefined : new Date().toISOString(),
                completedAt: undefined
              }
            : task
        )
      };
    });
  }

  reorderTasks(tasks: ActiveRunTask[]): void {
    this.activeRun.update(run => {
      if (!run) return null;
      return { ...run, tasks };
    });
  }

  updateLeaveTime(
    leaveDateTime: string,
    calculatedStartDateTime: string,
    tasks: ActiveRunTask[]
  ): void {
    this.activeRun.update(run => {
      if (!run) return null;

      return {
        ...run,
        leaveDateTime,
        calculatedStartDateTime,
        tasks
      };
    });
  }
  
}