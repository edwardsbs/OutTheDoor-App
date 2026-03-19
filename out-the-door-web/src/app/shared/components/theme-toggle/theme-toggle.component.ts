import { Component, inject, OnInit } from '@angular/core';
import { AppStore } from '../../../core/stores/app.store';

@Component({
  selector: 'theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent {

  readonly appStore = inject(AppStore);

  onToggle(): void {
    this.appStore.toggleTheme();
  }
}
