import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, ViewChild, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var L: any;

@Component({
  selector: 'app-weather-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-map.html',
  styleUrls: ['./weather-map.css']
})
export class WeatherMapComponent implements OnInit, OnChanges, OnDestroy {
  @Input() lat: number = 0;
  @Input() lon: number = 0;
  @Input() cityName: string = '';
  
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  LAYERS = [
    { id: 'precipitation_new', label: '🌧 Rain',   color: '#2563eb', opacity: 1.0  }, // Deep Blue
    { id: 'clouds_new',        label: '☁️ Clouds', color: '#4f46e5', opacity: 1.0  }, // Deep Indigo
    { id: 'temp_new',          label: '🌡 Temp',   color: '#ea580c', opacity: 0.85 }, // Deep Orange
    { id: 'wind_new',          label: '💨 Wind',   color: '#059669', opacity: 0.90 }, // Deep Emerald
  ];

  BASE_TILES = {
    dark:  'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  };

  activeLayer = 'precipitation_new';
  leafletMap: any = null;
  weatherLayer: any = null;
  baseLayer: any = null;
  observer: MutationObserver | null = null;
  baseUrl = isDevMode() ? 'http://localhost:5000/api/weather' : '/api/weather';

  ngOnInit() {
    this.ensureLeafletLoaded().then(() => this.initMap());
    
    this.observer = new MutationObserver(() => {
      if (!this.leafletMap || !(window as any)['L']) return;
      this.applyBaseLayer((window as any)['L']);
      this.applyWeatherLayer(this.activeLayer, (window as any)['L']);
    });
    this.observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
  }

  ngOnChanges() {
    if (this.leafletMap) {
      this.leafletMap.flyTo([this.lat, this.lon], 5, { duration: 1.2 });
      
      // Update marker
      this.leafletMap.eachLayer((layer: any) => {
        if (layer.options && layer.options.icon && layer.options.icon.options.className === '') {
          this.leafletMap.removeLayer(layer);
        }
      });
      const icon = L.divIcon({
        html: `<div class="map-pin"><span>${this.cityName}</span></div>`,
        className: '',
        iconAnchor: [0, 0],
      });
      L.marker([this.lat, this.lon], { icon }).addTo(this.leafletMap);
    }
  }

  ngOnDestroy() {
    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  ensureLeafletLoaded(): Promise<void> {
    return new Promise((resolve) => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      
      if ((window as any)['L']) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      }
    });
  }

  initMap() {
    if (!this.mapContainer || this.leafletMap) return;
    const L = (window as any)['L'];
    
    this.leafletMap = L.map(this.mapContainer.nativeElement, {
      center: [this.lat, this.lon],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    });
    
    this.applyBaseLayer(L);
    
    const icon = L.divIcon({
      html: `<div class="map-pin"><span>${this.cityName}</span></div>`,
      className: '',
      iconAnchor: [0, 0],
    });
    L.marker([this.lat, this.lon], { icon }).addTo(this.leafletMap);
    
    this.applyWeatherLayer(this.activeLayer, L);
  }

  isDark() {
    return document.body.dataset['theme'] === 'dark';
  }

  applyBaseLayer(L: any) {
    if (!this.leafletMap) return;
    if (this.baseLayer) {
      this.leafletMap.removeLayer(this.baseLayer);
    }
    this.baseLayer = L.tileLayer(
      this.isDark() ? this.BASE_TILES.dark : this.BASE_TILES.light,
      { subdomains: 'abcd', maxZoom: 19 }
    ).addTo(this.leafletMap);
    this.baseLayer.bringToBack();
  }

  applyWeatherLayer(layerId: string, L: any) {
    if (!this.leafletMap || !L) return;
    if (this.weatherLayer) {
      this.leafletMap.removeLayer(this.weatherLayer);
      this.weatherLayer = null;
    }
    const layer = this.LAYERS.find(l => l.id === layerId);
    
    const tileOptions = {
      opacity: layer?.opacity ?? 0.7,
      maxZoom: 19,
      className: (layerId === 'clouds_new' ? 'cloud-layer-tiles ' : '') + (this.isDark() ? 'weather-layer-dark' : ''),
    };
    
    this.weatherLayer = L.tileLayer(
      `${this.baseUrl}/tile/${layerId}/{z}/{x}/{y}`,
      tileOptions
    ).addTo(this.leafletMap);
  }

  switchLayer(layerId: string) {
    this.activeLayer = layerId;
    this.applyWeatherLayer(layerId, (window as any)['L']);
  }
}
