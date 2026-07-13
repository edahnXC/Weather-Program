import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forecast-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forecast-panel.html',
  styleUrls: ['./forecast-panel.css']
})
export class ForecastPanelComponent implements OnChanges {
  @Input() forecastData: any;
  @Input() timezone: number = 0;

  days: any[] = [];
  hourly: any[] = [];

  ngOnChanges() {
    if (this.forecastData?.list) {
      this.updateData();
    }
  }

  updateData() {
    const dailyMap: any = {};
    this.forecastData.list.forEach((item: any) => {
      const utc = item.dt * 1000;
      const offset = this.timezone * 1000;
      const local = new Date(utc + offset + new Date().getTimezoneOffset() * 60000);
      const dayKey = local.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const hour = local.getHours();

      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { ...item, dayKey, hour };
      } else {
        const prevDiff = Math.abs(dailyMap[dayKey].hour - 12);
        const curDiff = Math.abs(hour - 12);
        if (curDiff < prevDiff) {
          dailyMap[dayKey] = { ...item, dayKey, hour };
        }
      }
    });

    this.days = Object.values(dailyMap).slice(0, 5);
    this.hourly = this.forecastData.list.slice(0, 8);
  }

  fmtHour(ts: number) {
    const utc = ts * 1000;
    const offset = this.timezone * 1000;
    const local = new Date(utc + offset + new Date().getTimezoneOffset() * 60000);
    return local.toLocaleTimeString([], { hour: '2-digit', hour12: true });
  }

  Math = Math;
}
