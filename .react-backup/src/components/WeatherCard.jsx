import { useState } from 'react'
import '../styles/WeatherCard.css'

const WeatherCard = ({ weatherData }) => {
    const [isCelsius, setIsCelsius] = useState(true)

    const fmt = (ts, tz) => {
        if (!ts || !tz) return ''
        const d = new Date(ts * 1000)
        const utc = d.getTime() + d.getTimezoneOffset() * 60000
        return new Date(utc + tz * 1000).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', hour12: true
        })
    }

    const localTime = () => {
        if (!weatherData?.timezone) return ''
        const now = new Date()
        const utc = now.getTime() + now.getTimezoneOffset() * 60000
        return new Date(utc + weatherData.timezone * 1000).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', hour12: true
        })
    }

    const toF = (c) => Math.round((c * 9) / 5 + 32)
    const temp = (c) => isCelsius ? Math.round(c) : toF(c)
    const unit = isCelsius ? '°C' : '°F'

    const { name, sys, weather, main, wind, visibility, timezone } = weatherData
    const icon = weather[0].icon
    const description = weather[0].description
    const isDay = icon.includes('d')

    const details = [
        { label: 'Feels Like', value: `${temp(main.feels_like)}${unit}`, icon: '🌡️' },
        { label: 'Humidity', value: `${main.humidity}%`, icon: '💧' },
        { label: 'Wind', value: `${wind.speed.toFixed(1)} m/s`, icon: '💨' },
        { label: 'Pressure', value: `${main.pressure} hPa`, icon: '🔵' },
        { label: 'Visibility', value: visibility ? `${(visibility / 1000).toFixed(1)} km` : 'N/A', icon: '👁️' },
        { label: 'Cloud Cover', value: `${weatherData.clouds?.all ?? '--'}%`, icon: '☁️' },
    ]

    return (
        <div className="weather-card">
            <div className="card-top">
                <div className="location-block">
                    <h2 className="city-name">{name}<span className="country">, {sys.country}</span></h2>
                    <p className="date-time">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        <span className="dot">·</span>
                        <span className="local-time">{localTime()}</span>
                    </p>
                </div>
                <div className="icon-block">
                    <img
                        src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                        alt={description}
                        className="weather-icon"
                    />
                    <span className="condition-badge">{isDay ? 'Day' : 'Night'}</span>
                </div>
            </div>

            <div className="temp-hero">
                <div className="temp-row">
                    <span className="temp-big">{temp(main.temp)}</span>
                    <div className="temp-meta">
                        <button className="unit-toggle" onClick={() => setIsCelsius(!isCelsius)}>
                            {unit} <span className="toggle-hint">{isCelsius ? '→ °F' : '→ °C'}</span>
                        </button>
                        <span className="temp-range">
                            ↑ {temp(main.temp_max)}° · ↓ {temp(main.temp_min)}°
                        </span>
                    </div>
                </div>
                <p className="weather-desc">{description}</p>
            </div>

            <div className="details-grid">
                {details.map(d => (
                    <div className="detail-tile" key={d.label}>
                        <span className="tile-icon">{d.icon}</span>
                        <span className="tile-value">{d.value}</span>
                        <span className="tile-label">{d.label}</span>
                    </div>
                ))}
            </div>

            <div className="sun-row">
                <div className="sun-item">
                    <span className="sun-emoji">🌅</span>
                    <div>
                        <span className="sun-label">Sunrise</span>
                        <span className="sun-time">{fmt(sys.sunrise, timezone)}</span>
                    </div>
                </div>
                <div className="sun-divider" />
                <div className="sun-item">
                    <span className="sun-emoji">🌇</span>
                    <div>
                        <span className="sun-label">Sunset</span>
                        <span className="sun-time">{fmt(sys.sunset, timezone)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WeatherCard