import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ActiveRunStore } from '../../core/stores/active-run.store';
import { IdleClockService } from '../../core/services/idle-clock.service';

@Component({
  selector: 'run-ended',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './run-ended.component.html',
  styleUrl: './run-ended.component.scss'
})
export class RunEndedComponent {
  private readonly router = inject(Router);
  readonly activeRunStore = inject(ActiveRunStore);
  private readonly idleClockService = inject(IdleClockService);

  readonly run = this.activeRunStore.activeRun;
  readonly completedCount = computed(() => this.activeRunStore.completedTasks().length);
  readonly skippedCount = computed(() => this.activeRunStore.skippedTasks().length);
  readonly remainingCount = computed(() => this.activeRunStore.remainingTasks().length);

  constructor() {
    this.idleClockService.scheduleIdleClock(60_000);
  }

  goHome(): void {
    this.activeRunStore.clearRun();
    this.idleClockService.clear();
    this.router.navigate(['/']);
  }

  goIdleClock(): void {
    this.activeRunStore.clearRun();
    this.idleClockService.goToIdleClockNow();
  }
}