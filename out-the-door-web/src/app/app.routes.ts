import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ScenarioEditorComponent } from './features/scenario-editor/scenario-editor.component';
import { TodaySetupComponent } from './features/today-setup/today-setup.component';
import { ActiveRunComponent } from './features/active-run/active-run.component';
import { IdleClockComponent } from './features/idle-clock/idle-clock.component';
import { RunEndedComponent } from './features/run-ended/run-ended.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'scenario/new', component: ScenarioEditorComponent, canActivate: [authGuard] },
  { path: 'scenario/:id', component: ScenarioEditorComponent, canActivate: [authGuard] },
  { path: 'today-setup/:scenarioId', component: TodaySetupComponent, canActivate: [authGuard] },
  { path: 'active-run', component: ActiveRunComponent, canActivate: [authGuard] },
  { path: 'run-ended', component: RunEndedComponent, canActivate: [authGuard] },
  { path: 'idle-clock', component: IdleClockComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
