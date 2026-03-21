import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { ActiveRunStore } from '../../core/stores/active-run.store';
import { AppStore } from '../../core/stores/app.store';
import { TimerService } from '../../core/services/timer.service';
import { ScheduleCalculatorService } from '../../core/services/schedule-calculator.service';
import { AudioAlertService } from '../../core/services/audio-alert.service';
import { WeatherService } from '../../core/services/weather.service';
import { ActiveRunTask } from '../../core/models/active-run.model';
import { WeatherHour } from '../../core/models/weather.model';

@Component({
  selector: 'active-run',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './active-run.component.html',
  styleUrl: './active-run.component.scss'
})
export class ActiveRunComponent implements AfterViewInit, OnDestroy {
  readonly activeRunStore = inject(ActiveRunStore);
  readonly appStore = inject(AppStore);

  private readonly timerService = inject(TimerService);
  private readonly router = inject(Router);
  private readonly scheduleCalculator = inject(ScheduleCalculatorService);
  private readonly audioAlertService = inject(AudioAlertService);
  private readonly weatherService = inject(WeatherService);

  @ViewChild('countdownWrapRef') countdownWrapRef?: ElementRef<HTMLElement>;
  @ViewChild('countdownTextRef') countdownTextRef?: ElementRef<HTMLElement>;

  readonly now = this.activeRunStore.now;
  readonly activeRun = this.activeRunStore.activeRun;
  readonly health = this.activeRunStore.scheduleHealth;
  readonly timeProgressPercent = this.activeRunStore.timeProgressPercent;
  readonly taskProgressPercent = this.activeRunStore.taskProgressPercent;

  readonly isEditLeaveTimeOpen = signal(false);
  readonly editableLeaveTime = signal('08:00');
  readonly weatherHours = signal<WeatherHour[]>([]);
  readonly countdownFontSizePx = signal(96);

  private resizeObserver: ResizeObserver | null = null;
  private fitTextTimeoutId: number | null = null;

  readonly remainingSeconds = computed(() => {
    const run = this.activeRun();
    if (!run) return 0;

    const end = new Date(run.leaveDateTime).getTime();
    const current = this.now().getTime();
    return Math.max(0, Math.floor((end - current) / 1000));
  });

  readonly countdownUrgency = computed<'safe' | 'warning' | 'danger'>(() => {
    const remaining = this.remainingSeconds();
    if (remaining <= 10 * 60) return 'danger';
    if (remaining <= 20 * 60) return 'warning';
    return 'safe';
  });

  readonly currentTask = computed(() => {
    const run = this.activeRun();
    if (!run) return null;

    const nowMs = this.now().getTime();

    return (
      run.tasks.find(task => {
        if (task.completedAt || task.skippedAt) return false;
        const start = new Date(task.plannedStart).getTime();
        const end = new Date(task.plannedEnd).getTime();
        return nowMs >= start && nowMs < end;
      }) ??
      this.remainingOpenTasks()[0] ??
      null
    );
  });

  readonly nextTask = computed(() => {
    const current = this.currentTask();
    const remaining = this.remainingOpenTasks();
    if (!current) return remaining[0] ?? null;

    const currentIndex = remaining.findIndex(task => task.id === current.id);
    return currentIndex >= 0 ? remaining[currentIndex + 1] ?? null : null;
  });

  readonly remainingOpenTasks = computed(() => {
    const run = this.activeRun();
    if (!run) return [];
    return run.tasks.filter(task => !task.completedAt && !task.skippedAt);
  });

  constructor() {
    this.timerService.start();
    this.audioAlertService.init();

    const run = this.activeRun();
    if (!run) {
      this.router.navigate(['/']);
      return;
    }

    this.editableLeaveTime.set(
      this.scheduleCalculator.toTimeInputValue(run.leaveDateTime)
    );

    this.loadWeather();

    effect(() => {
      const runValue = this.activeRun();
      if (!runValue) return;

      const remaining = this.remainingSeconds();
      this.audioAlertService.checkAlerts(remaining, [30, 15, 10, 5, 1]);

      if (remaining <= 0 && runValue.status === 'active') {
        this.activeRunStore.setRunStatus('completed');
        this.router.navigate(['/run-ended']);
      }
    });

    effect(() => {
      this.remainingSeconds();
      this.scheduleCountdownFit();
    });
  }

  ngAfterViewInit(): void {
    this.setupCountdownResizeObserver();

    // Let layout fully settle before first fit. Browsers love drama.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.fitCountdownText();
      });
    });
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.fitTextTimeoutId !== null) {
      window.clearTimeout(this.fitTextTimeoutId);
      this.fitTextTimeoutId = null;
    }
  }

  async loadWeather(): Promise<void> {
    const run = this.activeRun();
    if (!run) return;

    try {
      // Temporary hard-coded location: Anniston, AL
      const latitude = 33.6598;
      const longitude = -85.8316;

      const hours = await this.weatherService.getHourlyWeather(
        latitude,
        longitude,
        run.leaveDateTime,
        5
      );

      this.weatherHours.set(hours);
    } catch (error) {
      console.error('Weather load failed', error);
      this.weatherHours.set([]);
    }
  }

  toggleTaskComplete(taskId: string): void {
    this.audioAlertService.init();
    this.activeRunStore.toggleTaskComplete(taskId);
  }

  skipTask(taskId: string): void {
    this.activeRunStore.skipTask(taskId);
  }

  endRun(): void {
    this.activeRunStore.setRunStatus('cancelled');
    this.router.navigate(['/run-ended']);
  }

  toggleTheme(): void {
    this.appStore.toggleTheme();
  }

  openLeaveTimeEditor(): void {
    const run = this.activeRun();
    if (!run) return;

    this.editableLeaveTime.set(
      this.scheduleCalculator.toTimeInputValue(run.leaveDateTime)
    );
    this.isEditLeaveTimeOpen.set(true);
  }

  closeLeaveTimeEditor(): void {
    this.isEditLeaveTimeOpen.set(false);
  }

  async saveLeaveTime(): Promise<void> {
    const run = this.activeRun();
    if (!run) return;

    const currentLeave = new Date(run.leaveDateTime);
    const newLeaveDateTime = this.scheduleCalculator.combineDateAndTime(
      currentLeave,
      this.editableLeaveTime()
    );

    const recalculated = this.scheduleCalculator.recalculateRun(run, newLeaveDateTime);

    this.activeRunStore.updateLeaveTime(
      recalculated.leaveDateTime,
      recalculated.calculatedStartDateTime,
      recalculated.tasks
    );

    this.isEditLeaveTimeOpen.set(false);
    this.audioAlertService.reset();
    await this.loadWeather();
    this.scheduleCountdownFit();
  }

  dropTask(event: CdkDragDrop<ActiveRunTask[]>): void {
    const run = this.activeRun();
    if (!run) return;

    const reordered = [...run.tasks];
    moveItemInArray(reordered, event.previousIndex, event.currentIndex);

    const normalized = reordered.map((task, index) => ({
      ...task,
      order: index + 1
    }));

    const recalculated = this.scheduleCalculator.recalculateRun(
      { ...run, tasks: normalized },
      new Date(run.leaveDateTime)
    );

    this.activeRunStore.reorderTasks(recalculated.tasks);
  }

  formatCountdown(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds].map(v => `${v}`.padStart(2, '0')).join(':');
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  formatIso(isoString: string): string {
    return new Date(isoString).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  healthLabel(): string {
    const health = this.health().health;
    if (health === 'behind') return `You're Running Behind`;
    if (health === 'ahead') return `You're Actually Ahead of Schedule`;
    return `You're On Schedule`;
  }

  taskStateLabel(taskId: string): string | null {
    const current = this.currentTask();
    const next = this.nextTask();

    if (current?.id === taskId) return 'Now';
    if (next?.id === taskId) return 'Next';
    return null;
  }

  private setupCountdownResizeObserver(): void {
    const wrapEl = this.countdownWrapRef?.nativeElement;
    if (!wrapEl) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.scheduleCountdownFit();
    });

    this.resizeObserver.observe(wrapEl);
  }

  private scheduleCountdownFit(): void {
    if (this.fitTextTimeoutId !== null) {
      window.clearTimeout(this.fitTextTimeoutId);
    }

    this.fitTextTimeoutId = window.setTimeout(() => {
      requestAnimationFrame(() => {
        this.fitCountdownText();
      });
    }, 0);
  }

  private fitCountdownText(): void {
    const wrapEl = this.countdownWrapRef?.nativeElement;
    const textEl = this.countdownTextRef?.nativeElement;

    if (!wrapEl || !textEl) return;

    const availableWidth = wrapEl.clientWidth;
    if (availableWidth <= 0) return;

    const minSize = 28;
    const maxSize = 140;

    let low = minSize;
    let high = maxSize;
    let best = minSize;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      textEl.style.fontSize = `${mid}px`;

      const textWidth = textEl.getBoundingClientRect().width;

      if (textWidth <= availableWidth) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    this.countdownFontSizePx.set(best);
  }
}