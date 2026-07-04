import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Scenario } from '../models/scenario.model';

@Injectable({ providedIn: 'root' })
export class ScenarioApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBase}/scenarios`;

  getAll(): Promise<Scenario[]> {
    return firstValueFrom(this.http.get<Scenario[]>(this.baseUrl));
  }

  create(scenario: Scenario): Promise<Scenario> {
    return firstValueFrom(this.http.post<Scenario>(this.baseUrl, scenario));
  }

  update(scenario: Scenario): Promise<Scenario> {
    return firstValueFrom(
      this.http.put<Scenario>(`${this.baseUrl}/${scenario.id}`, scenario)
    );
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
}
