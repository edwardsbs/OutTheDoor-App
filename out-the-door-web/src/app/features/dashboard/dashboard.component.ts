import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ScenarioStore } from '../../core/stores/scenario.store';
import { ActiveRunStore } from '../../core/stores/active-run.store';

@Component({
  selector: 'dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly scenarioStore = inject(ScenarioStore);
  readonly activeRunStore = inject(ActiveRunStore);
  private readonly router = inject(Router);

  openScenario(id: string): void {
    this.router.navigate(['/scenario', id]);
  }

  startScenario(id: string): void {
    this.router.navigate(['/today-setup', id]);
  }

  resumeRun(): void {
    const run = this.activeRunStore.activeRun();
    if (!run) return;

    if (run.status === 'completed' || run.status === 'cancelled') {
      this.router.navigate(['/run-ended']);
      return;
    }

    this.router.navigate(['/active-run']);
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
}