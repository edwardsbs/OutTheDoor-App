import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Session, SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);

  async login(username: string): Promise<Session> {
    const result = await firstValueFrom(
      this.http.post<Session>(`${environment.apiBase}/auth/login`, { username })
    );
    this.session.setSession(result);
    return result;
  }

  logout(): void {
    this.session.clear();
  }
}
