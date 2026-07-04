import { Injectable, effect, inject, signal } from '@angular/core';
import { AppMode } from '../models/app-mode.model';
import { UiSettings } from '../models/ui-settings.model';
import { StorageService } from '../services/storage.service';

// Minutes of inactivity before the app switches to the idle clock.
const DEFAULT_IDLE_TIMEOUT_MINUTES = 3;
// Floor to guard against stale/debug values (e.g. 0.01) that make the app
// bounce back to the idle clock almost instantly.
const MIN_IDLE_TIMEOUT_MINUTES = 0.5;

@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly storage = inject(StorageService);

  readonly mode = signal<AppMode>('dashboard');

  readonly uiSettings = signal<UiSettings>({
    theme: 'dark',
    soundEnabled: true,
    idleClockTimeoutMinutes: DEFAULT_IDLE_TIMEOUT_MINUTES
  });

  constructor() {
    effect(() => {
      this.storage.saveUiSettings(this.uiSettings()).catch(console.error);
    });
  }

  async load(): Promise<void> {
    const stored = await this.storage.getUiSettings();
    if (stored) {
      this.uiSettings.set(this.sanitize(stored));
    }
  }

  private sanitize(settings: UiSettings): UiSettings {
    const timeout = settings.idleClockTimeoutMinutes;
    const valid =
      typeof timeout === 'number' &&
      Number.isFinite(timeout) &&
      timeout >= MIN_IDLE_TIMEOUT_MINUTES;

    return valid
      ? settings
      : { ...settings, idleClockTimeoutMinutes: DEFAULT_IDLE_TIMEOUT_MINUTES };
  }

  setMode(mode: AppMode): void {
    this.mode.set(mode);
  }

  toggleTheme(): void {
    this.uiSettings.update(settings => ({
      ...settings,
      theme: settings.theme === 'light' ? 'dark' : 'light'
    }));
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.uiSettings.update(settings => ({ ...settings, theme }));
  }
}