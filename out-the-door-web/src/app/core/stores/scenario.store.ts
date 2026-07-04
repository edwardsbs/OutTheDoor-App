import { Injectable, computed, inject, signal } from '@angular/core';
import { Scenario } from '../models/scenario.model';
import { ScenarioApiService } from '../services/scenario-api.service';
import { generateId } from '../utils/uuid.util';

@Injectable({ providedIn: 'root' })
export class ScenarioStore {
  private readonly api = inject(ScenarioApiService);

  readonly scenarios = signal<Scenario[]>([]);

  readonly sortedScenarios = computed(() =>
    [...this.scenarios()].sort((a, b) => a.name.localeCompare(b.name))
  );

  async load(): Promise<void> {
    const scenarios = await this.api.getAll();
    this.scenarios.set(scenarios);
  }

  setScenarios(scenarios: Scenario[]): void {
    this.scenarios.set(scenarios);
  }

  async addScenario(scenario: Scenario): Promise<void> {
    const saved = await this.api.create(scenario);
    this.scenarios.update(items => [...items, saved]);
  }

  async updateScenario(updated: Scenario): Promise<void> {
    const saved = await this.api.update(updated);
    this.scenarios.update(items =>
      items.map(item => (item.id === saved.id ? saved : item))
    );
  }

  async upsertScenario(scenario: Scenario): Promise<void> {
    const existing = this.getScenarioById(scenario.id);
    if (existing) {
      await this.updateScenario(scenario);
    } else {
      await this.addScenario(scenario);
    }
  }

  async deleteScenario(id: string): Promise<void> {
    await this.api.delete(id);
    this.scenarios.update(items => items.filter(item => item.id !== id));
  }

  getScenarioById(id: string): Scenario | undefined {
    return this.scenarios().find(s => s.id === id);
  }

  createEmptyScenario(): Scenario {
    const now = new Date().toISOString();

    return {
      id: generateId(),
      name: '',
      defaultLeaveTime: '08:00',
      bufferMinutes: 0,
      autoStart: true,
      alertMinutes: [30, 15, 10, 5, 1],
      tasks: [],
      createdAt: now,
      updatedAt: now
    };
  }
}