import { useEffect, useRef, useState } from 'react'
import '../styles/WeatherMap.css'

const LAYERS = [
    { id: 'precipitation_new', label: '🌧 Rain', color: '#60a5fa' },
    { id: 'clouds_new',        label: '☁️ Clouds', color: '#94a3b8' },
    { id: 'temp_new',          label: '🌡 Temp', color: '#f97316' },
    { id: 'wind_new',          label: '💨 Wind', color: '#34d399' },
]

const WeatherMap = ({ lat, lon, cityName }) => {
    const mapRef = useRef(null)
    const leafletMap = useRef(null)
    const weatherLayer = useRef(null)
    const [activeLayer, setActiveLayer] = useState('precipitation_new')
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY

    useEffect(() => {
        // Dynamically load Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link')
            link.id = 'leaflet-css'
            link.rel = 'stylesheet'
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
            document.head.appendChild(link)
        }

        // Dynamically load Leaflet JS
        const initMap = () => {
            if (!mapRef.current || leafletMap.current) return
            const L = window.L

            leafletMap.current = L.map(mapRef.current, {
                center: [lat, lon],
                zoom: 7,
                zoomControl: true,
                attributionControl: false,
            })

            // Base tile layer (dark/light style)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                subdomains: 'abcd',
                maxZoom: 19,
            }).addTo(leafletMap.current)

            // City marker
            const icon = L.divIcon({
                html: `<div class="map-pin"><span>${cityName}</span></div>`,
                className: '',
                iconAnchor: [0, 0],
            })
            L.marker([lat, lon], { icon }).addTo(leafletMap.current)

            // Weather overlay
            addWeatherLayer(activeLayer)
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

    const addWeatherLayer = (layerId) => {
        const L = window.L
        if (!leafletMap.current || !L) return

        if (weatherLayer.current) {
            leafletMap.current.removeLayer(weatherLayer.current)
        }

        weatherLayer.current = L.tileLayer(
            `https://tile.openweathermap.org/map/${layerId}/{z}/{x}/{y}.png?appid=${apiKey}`,
            { opacity: 0.75, maxZoom: 19 }
        ).addTo(leafletMap.current)
    }

    const switchLayer = (layerId) => {
        setActiveLayer(layerId)
        addWeatherLayer(layerId)
    }

    // Fly to new location when coords change
    useEffect(() => {
        if (leafletMap.current) {
            leafletMap.current.flyTo([lat, lon], 7, { duration: 1.2 })
        }
    }, [lat, lon])

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
            <div ref={mapRef} className="map-container" />
        </div>
    )
}

export default WeatherMap