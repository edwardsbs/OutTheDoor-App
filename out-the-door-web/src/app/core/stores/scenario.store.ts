import { Injectable, computed, inject, signal } from '@angular/core';
import { Scenario } from '../models/scenario.model';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class ScenarioStore {
  private readonly storage = inject(StorageService);

  readonly scenarios = signal<Scenario[]>([]);

  readonly sortedScenarios = computed(() =>
    [...this.scenarios()].sort((a, b) => a.name.localeCompare(b.name))
  );

  async load(): Promise<void> {
    const scenarios = await this.storage.getAllScenarios();
    this.scenarios.set(scenarios);
  }

  setScenarios(scenarios: Scenario[]): void {
    this.scenarios.set(scenarios);
  }

  async addScenario(scenario: Scenario): Promise<void> {
    this.scenarios.update(items => [...items, scenario]);
    await this.storage.saveScenario(scenario);
  }

  async updateScenario(updated: Scenario): Promise<void> {
    this.scenarios.update(items =>
      items.map(item => (item.id === updated.id ? updated : item))
    );
    await this.storage.saveScenario(updated);
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
    this.scenarios.update(items => items.filter(item => item.id !== id));
    await this.storage.deleteScenario(id);
  }

  getScenarioById(id: string): Scenario | undefined {
    return this.scenarios().find(s => s.id === id);
  }

  createEmptyScenario(): Scenario {
    const now = new Date().toISOString();

    return {
      id: crypto.randomUUID(),
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