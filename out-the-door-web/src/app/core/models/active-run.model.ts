export type ActiveRunStatus =
  | 'pending'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type ScheduleHealth =
  | 'behind'
  | 'on-schedule'
  | 'ahead';

export interface ActiveRunTask {
  id: string;
  taskId?: string;
  name: string;
  durationMinutes: number;
  order: number;
  plannedStart: string;
  plannedEnd: string;
  completedAt?: string;
  skippedAt?: string;
  isQuickAdd?: boolean;
}

export interface ActiveRun {
  id: string;
  scenarioId: string;
  scenarioName: string;
  leaveDateTime: string;
  calculatedStartDateTime: string;
  startedAt?: string;
  endedAt?: string;
  status: ActiveRunStatus;
  tasks: ActiveRunTask[];
}

export interface ScheduleHealthSnapshot {
  plannedCompletedMinutes: number;
  actualCompletedMinutes: number;
  deltaMinutes: number;
  health: ScheduleHealth;
}