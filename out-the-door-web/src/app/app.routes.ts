import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ScenarioEditorComponent } from './features/scenario-editor/scenario-editor.component';
import { TodaySetupComponent } from './features/today-setup/today-setup.component';
import { ActiveRunComponent } from './features/active-run/active-run.component';
import { IdleClockComponent } from './features/idle-clock/idle-clock.component';
import { RunEndedComponent } from './features/run-ended/run-ended.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'scenario/new', component: ScenarioEditorComponent },
  { path: 'scenario/:id', component: ScenarioEditorComponent },
  { path: 'today-setup/:scenarioId', component: TodaySetupComponent },
  { path: 'active-run', component: ActiveRunComponent },
  { path: 'run-ended', component: RunEndedComponent },
  { path: 'idle-clock', component: IdleClockComponent },
  { path: '**', redirectTo: '' }
];