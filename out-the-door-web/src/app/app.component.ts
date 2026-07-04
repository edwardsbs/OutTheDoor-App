import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { AppStore } from './core/stores/app.store';
import { ScenarioStore } from './core/stores/scenario.store';
import { ActiveRunStore } from './core/stores/active-run.store';
import { IdleWatcherService } from './core/services/idle-watcher.service';
import { SessionService } from './core/services/session.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly appStore = inject(AppStore);
  private readonly scenarioStore = inject(ScenarioStore);
  private readonly activeRunStore = inject(ActiveRunStore);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  private readonly idleWatcher = inject(IdleWatcherService)

  readonly themeClass = computed(() =>
    this.appStore.uiSettings().theme === 'dark' ? 'theme-dark' : 'theme-light'
  );

  constructor() {
    this.bootstrap();
    this.idleWatcher.start()
  }

  private async bootstrap(): Promise<void> {
    // Device-local state loads regardless of auth.
    await this.appStore.load();
    await this.activeRunStore.load();

    // Scenarios are per-user; skip loading (and routing) until logged in.
    // The auth guard sends unauthenticated users to /login.
    if (!this.session.isLoggedIn()) {
      return;
    }

    await this.scenarioStore.load();

    const run = this.activeRunStore.activeRun();

    if (!run) return;

    if (run.status === 'active' || run.status === 'paused' || run.status === 'pending') {
      await this.router.navigate(['/active-run']);
      return;
    }

    if (run.status === 'completed' || run.status === 'cancelled') {
      await this.router.navigate(['/run-ended']);
    }
  }

}