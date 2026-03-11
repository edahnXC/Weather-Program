import { useEffect, useRef, useState } from 'react'
import '../styles/WeatherMap.css'

const LAYERS = [
    { id: 'precipitation_new', label: '🌧 Rain',   color: '#60a5fa', opacity: 0.7 },
    { id: 'clouds_new',        label: '☁️ Clouds', color: '#94a3b8', opacity: 0.75 },
    { id: 'temp_new',          label: '🌡 Temp',   color: '#f97316', opacity: 0.65 },
    { id: 'wind_new',          label: '💨 Wind',   color: '#34d399', opacity: 0.72 },
]

const BASE_TILES = {
    dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
}

const WeatherMap = ({ lat, lon, cityName }) => {
    const mapRef       = useRef(null)
    const leafletMap   = useRef(null)
    const weatherLayer = useRef(null)
    const baseLayer    = useRef(null)
    const [activeLayer, setActiveLayer] = useState('precipitation_new')
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY

    /* ── helpers ─────────────────────────────────────── */
    const isDark = () => document.body.dataset.theme === 'dark'

    const applyBaseLayer = (L) => {
        if (!leafletMap.current) return
        if (baseLayer.current) {
            leafletMap.current.removeLayer(baseLayer.current)
        }
        baseLayer.current = L.tileLayer(
            isDark() ? BASE_TILES.dark : BASE_TILES.light,
            { subdomains: 'abcd', maxZoom: 19 }
        ).addTo(leafletMap.current)
        baseLayer.current.bringToBack()
    }

    const applyWeatherLayer = (layerId, L) => {
        const Leaflet = L || window.L
        if (!leafletMap.current || !Leaflet) return
        if (weatherLayer.current) {
            leafletMap.current.removeLayer(weatherLayer.current)
            weatherLayer.current = null
        }
        const layer = LAYERS.find(l => l.id === layerId)
        weatherLayer.current = Leaflet.tileLayer(
            `https://tile.openweathermap.org/map/${layerId}/{z}/{x}/{y}.png?appid=${apiKey}`,
            { opacity: layer?.opacity ?? 0.7, maxZoom: 19 }
        ).addTo(leafletMap.current)
    }

    /* ── init map ────────────────────────────────────── */
    useEffect(() => {
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link')
            link.id = 'leaflet-css'
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)
        }

        const initMap = () => {
            if (!mapRef.current || leafletMap.current) return
            const L = window.L

            leafletMap.current = L.map(mapRef.current, {
                center: [lat, lon],
                zoom: 5,
                zoomControl: true,
                attributionControl: false,
            })

            applyBaseLayer(L)

            const icon = L.divIcon({
                html: `<div class="map-pin"><span>${cityName}</span></div>`,
                className: '',
                iconAnchor: [0, 0],
            })
            L.marker([lat, lon], { icon }).addTo(leafletMap.current)

            applyWeatherLayer(activeLayer, L)
        }

        if (window.L) {
            initMap()
        } else {
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
            script.onload = initMap
            document.head.appendChild(script)
        }

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove()
                leafletMap.current = null
            }
        }
    }, [lat, lon])

    /* ── watch for theme changes via MutationObserver ── */
    useEffect(() => {
        const observer = new MutationObserver(() => {
            if (!leafletMap.current || !window.L) return
            applyBaseLayer(window.L)
            applyWeatherLayer(activeLayer, window.L)
        })

        // Watch data-theme attribute on body
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme'],
        })

        return () => observer.disconnect()
    }, [activeLayer])

    /* ── fly to new city ─────────────────────────────── */
    useEffect(() => {
        if (leafletMap.current) {
            leafletMap.current.flyTo([lat, lon], 5, { duration: 1.2 })
        }
    }, [lat, lon])

    const switchLayer = (layerId) => {
        setActiveLayer(layerId)
        applyWeatherLayer(layerId, window.L)
    }

    return (
        <div className="weather-map-card">
            <div className="map-header">
                <h3 className="map-title">Weather Map</h3>
                <div className="layer-tabs">
                    {LAYERS.map(layer => (
                        <button
                            key={layer.id}
                            className={`layer-tab ${activeLayer === layer.id ? 'active' : ''}`}
                            style={{ '--tab-color': layer.color }}
                            onClick={() => switchLayer(layer.id)}
                        >
                            {layer.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="map-legend">
                {activeLayer === 'precipitation_new' && (
                    <div className="legend-bar">
                        <span>0mm</span>
                        <div className="legend-gradient rain-gradient" />
                        <span>50mm+</span>
                    </div>
                )}
                {activeLayer === 'temp_new' && (
                    <div className="legend-bar">
                        <span>-40°</span>
                        <div className="legend-gradient temp-gradient" />
                        <span>+40°</span>
                    </div>
                )}
                {activeLayer === 'clouds_new' && (
                    <div className="legend-bar">
                        <span>0%</span>
                        <div className="legend-gradient cloud-gradient" />
                        <span>100%</span>
                    </div>
                )}
                {activeLayer === 'wind_new' && (
                    <div className="legend-bar">
                        <span>0 m/s</span>
                        <div className="legend-gradient wind-gradient" />
                        <span>50 m/s</span>
                    </div>
                )}
            </div>

            <div ref={mapRef} className="map-container" />
        </div>
    )
}

export default WeatherMap