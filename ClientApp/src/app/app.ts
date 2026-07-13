import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from './services/weather';
import { WeatherCardComponent } from './components/weather-card/weather-card';
import { ForecastPanelComponent } from './components/forecast-panel/forecast-panel';
import { WeatherMapComponent } from './components/weather-map/weather-map';
import { WeatherAnimationComponent } from './components/weather-animation/weather-animation';
import { SearchBarComponent } from './components/search-bar/search-bar';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    WeatherCardComponent,
    ForecastPanelComponent,
    WeatherMapComponent,
    WeatherAnimationComponent,
    SearchBarComponent,
    ThemeToggleComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  location = '';
  hasSearched = false;
  geoLoading = false;
  geoError: string | null = null;
  weatherCondition: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(public weatherService: WeatherService) {
    effect(() => {
      const weatherData = this.weatherService.weatherData();
      if (!weatherData) return;

      const condition = weatherData.weather[0].main.toLowerCase();
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const localTime = new Date(utc + weatherData.timezone * 1000);
      const hours = localTime.getHours();
      const isNight = hours < 6 || hours >= 19;
      const temp = weatherData.main.temp;

      const classes = [
        isNight ? 'night' : 'day',
        condition,
        temp > 30 ? 'hot' : temp < 10 ? 'cold' : ''
      ].filter(Boolean);

      const theme = document.body.dataset['theme'];
      document.body.className = classes.join(' ');
      if (theme) document.body.dataset['theme'] = theme;

      // Wrap in setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => this.weatherCondition = condition, 0);
    });
  }

  async handleSearch(searchLocation: string) {
    const loc = searchLocation || this.location.trim();
    if (loc) {
      this.hasSearched = true;
      await this.weatherService.fetchWeather(loc);
    }
  }

  handleGeolocate() {
    if (!navigator.geolocation) {
      this.geoError = 'Geolocation is not supported by your browser';
      return;
    }
    this.geoLoading = true;
    this.geoError = null;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        this.hasSearched = true;
        await this.weatherService.fetchWeather(`${latitude.toFixed(4)},${longitude.toFixed(4)}`);
        this.geoLoading = false;
      },
      () => {
        this.geoError = 'Location access denied. Please search manually.';
        this.geoLoading = false;
      },
      { timeout: 10000 }
    );
  }

  goHome() {
    this.hasSearched = false;
    this.location = '';
    this.geoError = null;
    this.weatherCondition = null;
    const theme = document.body.dataset['theme'];
    document.body.className = '';
    if (theme) document.body.dataset['theme'] = theme;
  }
}
