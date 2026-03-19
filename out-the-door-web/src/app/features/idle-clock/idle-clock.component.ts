import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { WeatherService } from '../../core/services/weather.service';
import { WeatherHour } from '../../core/models/weather.model';

@Component({
  selector: 'idle-clock',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './idle-clock.component.html',
  styleUrl: './idle-clock.component.scss'
})
export class IdleClockComponent {
  private readonly router = inject(Router);
  private readonly weatherService = inject(WeatherService);

  now = new Date();
  weather: WeatherHour[] = [];

  constructor() {
    this.refreshClock();
    this.loadWeather();

    setInterval(() => {
      this.refreshClock();
    }, 1000);
  }

  returnToApp(): void {
    this.router.navigate(['/']);
  }

  private refreshClock(): void {
    this.now = new Date();
  }

  private async loadWeather(): Promise<void> {
    try {
      // const position = await this.getCurrentPosition();
      const latitude = 33.6598;
      const longitude = -85.8316;
      this.weather = await this.weatherService.getHourlyWeather(
        latitude, //position.coords.latitude,
        longitude, //position.coords.longitude,
        new Date().toISOString(),
        5
      );
    } catch (error) {
      console.error('Idle weather load failed', error);
      this.weather = [];
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 15 * 60 * 1000
      });
    });
  }
}