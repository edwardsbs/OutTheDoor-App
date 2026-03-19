import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { WeatherHour } from '../../../core/models/weather.model';

@Component({
  selector: 'weather-strip',
  templateUrl: './weather-strip.component.html',
  styleUrls: ['./weather-strip.component.scss'],
  imports: [CommonModule]
})
export class WeatherStripComponent {

  readonly hours = input<WeatherHour[]>([]);
}
