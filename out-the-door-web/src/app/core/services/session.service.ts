import { Injectable, computed, signal } from '@angular/core';

export interface Session {
  userId: string;
  username: string;
}

const STORAGE_KEY = 'otd-session';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _session = signal<Session | null>(readStoredSession());

  readonly session = this._session.asReadonly();
  readonly userId = computed(() => this._session()?.userId ?? null);
  readonly username = computed(() => this._session()?.username ?? null);
  readonly isLoggedIn = computed(() => this._session() !== null);

  setSession(session: Session): void {
    this._session.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  clear(): void {
    this._session.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }
}

function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed?.userId && parsed?.username ? parsed : null;
  } catch {
    return null;
  }
}
