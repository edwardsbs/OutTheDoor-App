import { Injectable } from '@angular/core';
import { WeatherHour } from '../models/weather.model';

interface OpenMeteoHourlyResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weathercode?: number[];
  };
}

@Injectable({ providedIn: 'root' })
export class WeatherService {
  async getHourlyWeather(
    latitude: number,
    longitude: number,
    startIso: string,
    hours = 5
  ): Promise<WeatherHour[]> {
    const start = new Date(startIso);
    const roundedStart = new Date(start);
    roundedStart.setMinutes(0, 0, 0);

    const end = new Date(roundedStart.getTime() + (hours - 1) * 60 * 60 * 1000);

    const startDate = this.toLocalDateString(roundedStart);
    const endDate = this.toLocalDateString(end);

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', `${latitude}`);
    url.searchParams.set('longitude', `${longitude}`);
    url.searchParams.set('hourly', 'temperature_2m,precipitation_probability,weathercode');
    url.searchParams.set('temperature_unit', 'fahrenheit');
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('start_date', startDate);
    url.searchParams.set('end_date', endDate);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Weather request failed: ${response.status}`);
    }

    const data = (await response.json()) as OpenMeteoHourlyResponse;

    const targetTimes = Array.from({ length: hours }).map((_, i) => {
      const dt = new Date(roundedStart.getTime() + i * 60 * 60 * 1000);
      return dt;
    });

    return targetTimes.map(target => {
      const localHourKey = this.toLocalHourKey(target);
      const index = data.hourly.time.findIndex(t => t.slice(0, 13) === localHourKey);

      if (index === -1) {
        return {
          time: target.toISOString(),
          tempF: 0,
          precipitationChance: 0,
          icon: '☁️'
        };
      }

      return {
        time: data.hourly.time[index],
        tempF: Math.round(data.hourly.temperature_2m[index]),
        precipitationChance: Math.round(data.hourly.precipitation_probability[index] ?? 0),
        icon: this.mapWeatherCodeToIcon(data.hourly.weathercode?.[index])
      };
    });
  }

  private toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private toLocalHourKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hour = `${date.getHours()}`.padStart(2, '0');
    return `${year}-${month}-${day}T${hour}`;
  }

  private mapWeatherCodeToIcon(code?: number): string {
    if (code == null) return '☁️';
    if ([0].includes(code)) return '☀️';
    if ([1, 2].includes(code)) return '⛅';
    if ([3].includes(code)) return '☁️';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return '🌨️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '☁️';
  }
}