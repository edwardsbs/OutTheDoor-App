import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs/operators';
import { ScenarioStore } from '../../core/stores/scenario.store';
import { ActiveRunStore } from '../../core/stores/active-run.store';
import { ScheduleCalculatorService } from '../../core/services/schedule-calculator.service';
import { Scenario, ScenarioTask } from '../../core/models/scenario.model';
import { ActiveRun } from '../../core/models/active-run.model';
import { generateId } from '../../core/utils/uuid.util';

@Component({
  selector: 'today-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './today-setup.component.html',
  styleUrl: './today-setup.component.scss'
})
export class TodaySetupComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly scenarioStore = inject(ScenarioStore);
  private readonly activeRunStore = inject(ActiveRunStore);
  private readonly scheduleCalculator = inject(ScheduleCalculatorService);

  readonly scenarioId = this.route.snapshot.paramMap.get('scenarioId') ?? '';
  readonly scenario = signal<Scenario | null>(null);
  readonly quickTasks = signal<ScenarioTask[]>([]);

  readonly form = this.fb.group({
    leaveTime: ['08:00', Validators.required]
  });

  readonly leaveTimeValue = toSignal(
    this.form.controls.leaveTime.valueChanges.pipe(
      startWith(this.form.controls.leaveTime.value ?? '08:00')
    ),
    { initialValue: this.form.controls.leaveTime.value ?? '08:00' }
  );

  readonly previewRun = computed<ActiveRun | null>(() => {
    const currentScenario = this.scenario();
    const leaveTime = this.leaveTimeValue() ?? '08:00';
    const quickTasks = this.quickTasks();

    if (!currentScenario || !leaveTime) return null;

    return this.scheduleCalculator.buildRunFromScenario(
      currentScenario,
      new Date(),
      leaveTime,
      quickTasks
    );
  });

  readonly canStartRun = computed(() => {
    const run = this.previewRun();
    if (!run) return false;

    const leaveMs = new Date(run.leaveDateTime).getTime();
    return leaveMs > Date.now();
  });

  constructor() {
    const scenario = this.scenarioStore.getScenarioById(this.scenarioId);
    if (!scenario) {
      this.router.navigate(['/']);
      return;
    }

    this.scenario.set(scenario);
    this.form.patchValue({
      leaveTime: scenario.defaultLeaveTime
    });
  }

  goToClockMode(): void {
    this.router.navigate(['/idle-clock']);
  }

  addQuickTask(nameInput: HTMLInputElement, durationInput: HTMLInputElement): void {
    const name = nameInput.value.trim();
    const duration = Number(durationInput.value || '5');

    if (!name || duration <= 0) return;

    const existingCount = this.scenario()?.tasks.length ?? 0;
    const quickCount = this.quickTasks().length;

    const task: ScenarioTask = {
      id: generateId(),
      name,
      durationMinutes: duration,
      order: existingCount + quickCount + 1,
      isOptional: false,
      isEnabledByDefault: true
    };

    this.quickTasks.update(items => [...items, task]);
    nameInput.value = '';
    durationInput.value = '5';
  }

  removeQuickTask(taskId: string): void {
    const reindexed = this.quickTasks()
      .filter(task => task.id !== taskId)
      .map((task, index) => ({
        ...task,
        order: (this.scenario()?.tasks.length ?? 0) + index + 1
      }));

    this.quickTasks.set(reindexed);
  }

  startRunEarly(): void {
    const run = this.previewRun();
    if (!run || !this.canStartRun()) return;

    const freshRun: ActiveRun = {
      ...run,
      id: generateId(),
      status: 'active',
      startedAt: new Date().toISOString(),
      endedAt: undefined
    };

    this.activeRunStore.startRun(freshRun);
    this.router.navigate(['/active-run']);
  }

  formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  formatClockTime(time24: string | null | undefined): string {
    if (!time24) return '--:--';
    const [hours, minutes] = time24.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  totalPlannedMinutes(): number {
    const run = this.previewRun();
    return run?.tasks.reduce((sum, task) => sum + task.durationMinutes, 0) ?? 0;
  }
}