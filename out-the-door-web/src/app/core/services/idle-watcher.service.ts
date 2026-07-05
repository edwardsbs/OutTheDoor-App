import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AppStore } from '../stores/app.store';
import { ActiveRunStore } from '../stores/active-run.store';

@Injectable({ providedIn: 'root' })
export class IdleWatcherService {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly appStore = inject(AppStore);
  private readonly activeRunStore = inject(ActiveRunStore);

  private timeoutId: number | null = null;
  private boundReset = () => this.resetTimer();
  private started = false;

  start(): void {
    if (this.started) return;
    this.started = true;

    const events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'];

    this.ngZone.runOutsideAngular(() => {
      events.forEach(event =>
        window.addEventListener(event, this.boundReset, { passive: true })
      );
    });

    this.resetTimer();
  }

  stop(): void {
    const events = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'];
    events.forEach(event =>
      window.removeEventListener(event, this.boundReset)
    );

    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.started = false;
  }

  resetTimer(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
    }

    const minutes = this.appStore.uiSettings().idleClockTimeoutMinutes ?? 60;
    const delayMs = minutes * 60 * 1000;

    this.timeoutId = window.setTimeout(() => {
      // Don't kick to the idle clock while a run is in progress — re-arm instead
      // so it resumes once the run ends.
      if (this.isRunInProgress()) {
        this.resetTimer();
        return;
      }

      this.ngZone.run(() => {
        this.router.navigate(['/idle-clock']);
      });
    }, delayMs);
  }

  private isRunInProgress(): boolean {
    const run = this.activeRunStore.activeRun();
    return (
      !!run &&
      (run.status === 'active' || run.status === 'paused' || run.status === 'pending')
    );
  }
}