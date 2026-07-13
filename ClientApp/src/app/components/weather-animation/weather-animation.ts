import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weather-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-animation.html',
  styleUrls: ['./weather-animation.css']
})
export class WeatherAnimationComponent implements OnChanges {
  @Input() condition: string = '';

  type: string | null = null;
  particles: any[] = [];

  COUNTS: { [key: string]: number } = {
    rain:        45,
    thunderstorm: 35,
    snow:        35,
    mist:        10,
    clouds:       8,
    clear:       12,
    hot:         14,
  };

  ngOnChanges() {
    this.type = this.getCondition();
    if (!this.type) {
      this.particles = [];
      return;
    }

    const count = this.COUNTS[this.type] || 0;

    this.particles = Array.from({ length: count }, (_, i) => ({
      id: i,
      delay:    `${(i * 0.37 % 5).toFixed(2)}s`,
      duration: `${((i * 0.53 % 3) + 2.5).toFixed(2)}s`,
      left:     `${((i * 7.3 + 3) % 100).toFixed(2)}%`,
      size:     `${((i * 0.17 % 0.6) + 0.5).toFixed(2)}`,
      drift:    `${((i * 11.7 % 40) - 20).toFixed(2)}px`,
    }));
  }

  getCondition(): string | null {
    const classes = document.body.classList;
    if (classes.contains('thunderstorm')) return 'thunderstorm';
    if (classes.contains('rain') || classes.contains('drizzle')) return 'rain';
    if (classes.contains('snow')) return 'snow';
    if (classes.contains('mist') || classes.contains('fog') || classes.contains('haze')) return 'mist';
    if (classes.contains('clouds')) return 'clouds';
    if (classes.contains('hot')) return 'hot';
    if (classes.contains('clear')) return 'clear';
    return null;
  }
}
