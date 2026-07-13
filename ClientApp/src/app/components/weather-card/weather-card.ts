import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weather-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-card.html',
  styleUrls: ['./weather-card.css']
})
export class WeatherCardComponent implements OnChanges {
  @Input() weatherData: any;
  isCelsius = true;

  currentDate = new Date();
  localTimeStr = '';
  sunriseStr = '';
  sunsetStr = '';
  isDay = true;
  details: any[] = [];

  ngOnChanges() {
    if (this.weatherData) {
      this.updateData();
    }
  }

  updateData() {
    this.localTimeStr = this.localTime();
    this.sunriseStr = this.fmt(this.weatherData.sys.sunrise, this.weatherData.timezone);
    this.sunsetStr = this.fmt(this.weatherData.sys.sunset, this.weatherData.timezone);
    this.isDay = this.weatherData.weather[0].icon.includes('d');
    
    this.details = [
      { label: 'Feels Like', value: `${this.temp(this.weatherData.main.feels_like)}${this.unit()}`, icon: '🌡️' },
      { label: 'Humidity', value: `${this.weatherData.main.humidity}%`, icon: '💧' },
      { label: 'Wind', value: `${this.weatherData.wind.speed.toFixed(1)} m/s`, icon: '💨' },
      { label: 'Pressure', value: `${this.weatherData.main.pressure} hPa`, icon: '🔵' },
      { label: 'Visibility', value: this.weatherData.visibility ? `${(this.weatherData.visibility / 1000).toFixed(1)} km` : 'N/A', icon: '👁️' },
      { label: 'Cloud Cover', value: `${this.weatherData.clouds?.all ?? '--'}%`, icon: '☁️' }
    ];
  }

  toggleUnit() {
    this.isCelsius = !this.isCelsius;
    this.updateData();
  }

  fmt(ts: number, tz: number) {
    if (!ts || tz == null) return '';
    const d = new Date(ts * 1000);
    const utc = d.getTime() + d.getTimezoneOffset() * 60000;
    return new Date(utc + tz * 1000).toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  localTime() {
    if (this.weatherData?.timezone == null) return '';
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + this.weatherData.timezone * 1000).toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  }

  toF(c: number) {
    return Math.round((c * 9) / 5 + 32);
  }

  temp(c: number) {
    return this.isCelsius ? Math.round(c) : this.toF(c);
  }

  unit() {
    return this.isCelsius ? '°C' : '°F';
  }
}
