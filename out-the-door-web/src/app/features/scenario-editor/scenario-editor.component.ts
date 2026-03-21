import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ScenarioStore } from '../../core/stores/scenario.store';
import { Scenario, ScenarioTask } from '../../core/models/scenario.model';
import { generateId } from '../../core/utils/uuid.util';

@Component({
  selector: 'app-scenario-editor-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './scenario-editor.component.html',
  styleUrl: './scenario-editor.component.scss'
})
export class ScenarioEditorComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly scenarioStore = inject(ScenarioStore);

  readonly scenarioId = this.route.snapshot.paramMap.get('id');
  readonly isNew = !this.scenarioId;
  readonly loadedScenario = signal<Scenario | null>(null);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    defaultLeaveTime: ['08:00', Validators.required],
    bufferMinutes: [0, [Validators.required, Validators.min(0)]],
    autoStart: [true],
    alertMinutesCsv: ['30,15,10,5,1']
  });

  readonly taskForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    durationMinutes: [5, [Validators.required, Validators.min(1)]],
    isOptional: [false],
    isEnabledByDefault: [true]
  });

  readonly tasks = signal<ScenarioTask[]>([]);

  readonly sortedTasks = computed(() =>
    [...this.tasks()].sort((a, b) => a.order - b.order)
  );

  constructor() {
    if (this.scenarioId) {
      const existing = this.scenarioStore.getScenarioById(this.scenarioId);
      if (existing) {
        this.loadedScenario.set(existing);
        this.form.patchValue({
          name: existing.name,
          defaultLeaveTime: existing.defaultLeaveTime,
          bufferMinutes: existing.bufferMinutes,
          autoStart: existing.autoStart,
          alertMinutesCsv: existing.alertMinutes.join(',')
        });
        this.tasks.set([...existing.tasks].sort((a, b) => a.order - b.order));
      }
    }
  }

  goToClockMode(): void {
    this.router.navigate(['/idle-clock']);
}
  addTask(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const value = this.taskForm.getRawValue();
    const nextOrder = this.tasks().length + 1;

    const newTask: ScenarioTask = {
      id: generateId(),
      name: value.name?.trim() ?? '',
      durationMinutes: Number(value.durationMinutes ?? 5),
      order: nextOrder,
      isOptional: !!value.isOptional,
      isEnabledByDefault: !!value.isEnabledByDefault
    };

    this.tasks.update(items => [...items, newTask]);
    this.taskForm.reset({
      name: '',
      durationMinutes: 5,
      isOptional: false,
      isEnabledByDefault: true
    });
  }

  removeTask(taskId: string): void {
    const remaining = this.tasks()
      .filter(task => task.id !== taskId)
      .map((task, index) => ({ ...task, order: index + 1 }));

    this.tasks.set(remaining);
  }

  moveTaskUp(taskId: string): void {
    const items = [...this.sortedTasks()];
    const index = items.findIndex(t => t.id === taskId);
    if (index <= 0) return;

    [items[index - 1], items[index]] = [items[index], items[index - 1]];
    this.tasks.set(this.reindex(items));
  }

  moveTaskDown(taskId: string): void {
    const items = [...this.sortedTasks()];
    const index = items.findIndex(t => t.id === taskId);
    if (index === -1 || index >= items.length - 1) return;

    [items[index], items[index + 1]] = [items[index + 1], items[index]];
    this.tasks.set(this.reindex(items));
  }

  async saveScenario(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const existing = this.loadedScenario();
    const now = new Date().toISOString();
    const value = this.form.getRawValue();

    const scenario: Scenario = {
      id: existing?.id ?? generateId(),
      name: value.name?.trim() ?? '',
      defaultLeaveTime: value.defaultLeaveTime ?? '08:00',
      bufferMinutes: Number(value.bufferMinutes ?? 0),
      autoStart: !!value.autoStart,
      alertMinutes: this.parseAlertMinutes(value.alertMinutesCsv ?? '30,15,10,5,1'),
      tasks: this.reindex(this.sortedTasks()),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };

    await this.scenarioStore.upsertScenario(scenario);
    await this.router.navigate(['/']);
  }

  private parseAlertMinutes(csv: string): number[] {
    return csv
      .split(',')
      .map(part => Number(part.trim()))
      .filter(value => Number.isFinite(value) && value > 0)
      .sort((a, b) => b - a);
  }

  private reindex(tasks: ScenarioTask[]): ScenarioTask[] {
    return tasks.map((task, index) => ({
      ...task,
      order: index + 1
    }));
  }

  readonly editingTaskId = signal<string | null>(null);

  readonly editTaskForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    durationMinutes: [5, [Validators.required, Validators.min(1)]],
    isOptional: [false],
    isEnabledByDefault: [true]
  });

  startEditTask(task: ScenarioTask): void {
    this.editingTaskId.set(task.id);
    this.editTaskForm.patchValue({
      name: task.name,
      durationMinutes: task.durationMinutes,
      isOptional: task.isOptional,
      isEnabledByDefault: task.isEnabledByDefault
    });
  }

  cancelEditTask(): void {
    this.editingTaskId.set(null);
    this.editTaskForm.reset({
      name: '',
      durationMinutes: 5,
      isOptional: false,
      isEnabledByDefault: true
    });
  }

  saveTaskEdit(taskId: string): void {
    if (this.editTaskForm.invalid) {
      this.editTaskForm.markAllAsTouched();
      return;
    }

    const value = this.editTaskForm.getRawValue();

    this.tasks.update(items =>
      items.map(task =>
        task.id === taskId
          ? {
              ...task,
              name: value.name?.trim() ?? '',
              durationMinutes: Number(value.durationMinutes ?? 5),
              isOptional: !!value.isOptional,
              isEnabledByDefault: !!value.isEnabledByDefault
            }
          : task
      )
    );

    this.cancelEditTask();
  }
}
