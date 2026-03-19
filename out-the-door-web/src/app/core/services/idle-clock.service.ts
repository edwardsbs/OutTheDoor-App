import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class IdleClockService {
  private readonly router = inject(Router);
  private timeoutId: number | null = null;

  scheduleIdleClock(delayMs: number = 60 * 60 * 1000): void {
    this.clear();

    this.timeoutId = window.setTimeout(() => {
      this.router.navigate(['/idle-clock']);
    }, delayMs);
  }

  goToIdleClockNow(): void {
    this.clear();
    this.router.navigate(['/idle-clock']);
  }

  clear(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}