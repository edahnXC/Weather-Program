import { Injectable, signal, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  weatherData = signal<any>(null);
  forecastData = signal<any>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  private baseUrl = isDevMode() ? 'http://localhost:5000/api/weather' : '/api/weather';

  constructor(private http: HttpClient) {}

  async fetchWeather(location: string, unit: string = 'metric') {
    this.loading.set(true);
    this.error.set(null);

    try {
      let query = `q=${location}`;

      if (location.includes(',')) {
        const [a, b] = location.split(',').map(s => s.trim());
        if (!isNaN(Number(a)) && !isNaN(Number(b))) {
          query = `lat=${a}&lon=${b}`;
        }
      }

      // Fetch weather and forecast in parallel
      const wReq = this.http.get<any>(`${this.baseUrl}?query=${encodeURIComponent(query)}&unit=${unit}`).toPromise();
      const fReq = this.http.get<any>(`${this.baseUrl}/forecast?query=${encodeURIComponent(query)}&unit=${unit}`).toPromise();

      let [wData, fData] = await Promise.all([wReq, fReq]);

      // India fallback logic from original hook
      if (wData.cod === '404' && !location.includes(',')) {
        const indiaQuery = `q=${location},IN`;
        const wReqInd = this.http.get<any>(`${this.baseUrl}?query=${encodeURIComponent(indiaQuery)}&unit=${unit}`).toPromise();
        const fReqInd = this.http.get<any>(`${this.baseUrl}/forecast?query=${encodeURIComponent(indiaQuery)}&unit=${unit}`).toPromise();
        [wData, fData] = await Promise.all([wReqInd, fReqInd]);
      }

      if (wData.cod && wData.cod !== 200) {
        throw new Error(`Couldn't find "${location}"`);
      }

      this.weatherData.set(wData);
      this.forecastData.set(fData);
    } catch (err: any) {
      this.error.set(err.message || 'Error fetching weather data');
      this.weatherData.set(null);
      this.forecastData.set(null);
    } finally {
      this.loading.set(false);
    }
  }
}
