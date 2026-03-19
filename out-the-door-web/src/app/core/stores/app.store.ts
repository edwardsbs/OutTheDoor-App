import { Injectable, effect, inject, signal } from '@angular/core';
import { AppMode } from '../models/app-mode.model';
import { UiSettings } from '../models/ui-settings.model';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly storage = inject(StorageService);

  readonly mode = signal<AppMode>('dashboard');

  readonly uiSettings = signal<UiSettings>({
    theme: 'dark',
    soundEnabled: true,
    idleClockTimeoutMinutes: 60
  });

  constructor() {
    effect(() => {
      this.storage.saveUiSettings(this.uiSettings()).catch(console.error);
    });
  }

  async load(): Promise<void> {
    const stored = await this.storage.getUiSettings();
    if (stored) {
      this.uiSettings.set(stored);
    }
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