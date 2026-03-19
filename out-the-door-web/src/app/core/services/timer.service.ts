import { Injectable, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActiveRunStore } from '../stores/active-run.store';
import { AppStore } from '../stores/app.store';

@Injectable({ providedIn: 'root' })
export class TimerService implements OnDestroy {
  private readonly activeRunStore = inject(ActiveRunStore);
  private readonly appStore = inject(AppStore);
  private readonly router = inject(Router);

  private intervalId: number | null = null;

  start(): void {
    if (this.intervalId !== null) return;

    this.activeRunStore.setNow(new Date());

    this.intervalId = window.setInterval(() => {
      this.activeRunStore.setNow(new Date());
      this.checkIdleClockTransition();
    }, 1000);
  }

  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private checkIdleClockTransition(): void {
    const run = this.activeRunStore.activeRun();
    if (!run?.endedAt) return;

    const timeoutMinutes = this.appStore.uiSettings().idleClockTimeoutMinutes;
    const endedAtMs = new Date(run.endedAt).getTime();
    const nowMs = Date.now();
    const elapsedMinutes = (nowMs - endedAtMs) / 60000;

    if (elapsedMinutes >= timeoutMinutes) {
      this.router.navigate(['/idle-clock']);
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }
}