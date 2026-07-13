import { useState, useEffect } from 'react'
import WeatherCard from './components/WeatherCard'
import ForecastPanel from './components/ForecastPanel'
import WeatherMap from './components/WeatherMap'
import WeatherAnimation from './components/WeatherAnimation'
import SearchBar from './components/SearchBar'
import ThemeToggle from './components/ThemeToggle'
import useWeather from './hooks/useWeather'
import './styles/App.css'
import './styles/theme.css'

function App() {
    const [location, setLocation] = useState('')
    const { weatherData, forecastData, loading, error, fetchWeather } = useWeather()
    const [hasSearched, setHasSearched] = useState(false)
    const [geoLoading, setGeoLoading] = useState(false)
    const [geoError, setGeoError] = useState(null)
    const [weatherCondition, setWeatherCondition] = useState(null)

    useEffect(() => {
        if (!weatherData) return
        const condition = weatherData.weather[0].main.toLowerCase()
        const now = new Date()
        const utc = now.getTime() + now.getTimezoneOffset() * 60000
        const localTime = new Date(utc + weatherData.timezone * 1000)
        const hours = localTime.getHours()
        const isNight = hours < 6 || hours >= 19
        const temp = weatherData.main.temp

        const classes = [
            isNight ? 'night' : 'day',
            condition,
            temp > 30 ? 'hot' : temp < 10 ? 'cold' : ''
        ].filter(Boolean)

        document.body.className = classes.join(' ')
        setWeatherCondition(condition)
    }, [weatherData])

    const handleSearch = async (e, searchLocation) => {
        e.preventDefault()
        const loc = searchLocation || location.trim()
        if (loc) {
            setHasSearched(true)
            await fetchWeather(loc)
        }
    }

    const handleGeolocate = () => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported by your browser')
            return
        }
        setGeoLoading(true)
        setGeoError(null)
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords
                setHasSearched(true)
                await fetchWeather(`${latitude.toFixed(4)},${longitude.toFixed(4)}`)
                setGeoLoading(false)
            },
            () => {
                setGeoError('Location access denied. Please search manually.')
                setGeoLoading(false)
            },
            { timeout: 10000 }
        )
    }

    const goHome = () => {
        setHasSearched(false)
        setLocation('')
        setGeoError(null)
        setWeatherCondition(null)
        document.body.className = ''
    }

    return (
        <>
            {/* Outside app-wrapper so it's in its own stacking context */}
            {weatherCondition && <WeatherAnimation condition={weatherCondition} />}

            <div className="app-wrapper">
                <div className="app-container">
                    <header className="app-header">
                        <div className="brand" onClick={goHome} role="button" title="Go home">
                            <span className="brand-icon">⛅</span>
                            <h1 className="brand-title">Nimbus</h1>
                        </div>

                        {hasSearched && (
                            <div className="header-controls">
                                <SearchBar
                                    location={location}
                                    setLocation={setLocation}
                                    handleSearch={handleSearch}
                                />
                                <button className="geo-btn-small" onClick={handleGeolocate} title="Use my location" disabled={geoLoading}>
                                    {geoLoading ? '⏳' : '📍'}
                                </button>
                                <ThemeToggle />
                            </div>
                        )}

                        {!hasSearched && (
                            <div className="header-controls" style={{ justifyContent: 'flex-end' }}>
                                <ThemeToggle />
                            </div>
                        )}
                    </header>

                    <main className="app-main">
                        {!hasSearched && !loading && (
                            <div className="welcome-screen">
                                <div className="welcome-orb" />
                                <h2 className="welcome-title">Real-time weather,<br />anywhere on Earth.</h2>
                                <p className="welcome-sub">Search a city or use your location</p>

                                <div className="welcome-search">
                                    <SearchBar
                                        location={location}
                                        setLocation={setLocation}
                                        handleSearch={handleSearch}
                                    />
                                </div>

                                <button
                                    className="geo-btn"
                                    onClick={handleGeolocate}
                                    disabled={geoLoading}
                                >
                                    {geoLoading
                                        ? <><span className="geo-spinner" /> Detecting location...</>
                                        : <><span>📍</span> Use my location</>
                                    }
                                </button>

                                {geoError && <p className="geo-error">{geoError}</p>}

                                <div className="sample-cities">
                                    {['Mumbai', 'Tokyo', 'London', 'New York'].map(city => (
                                        <button
                                            key={city}
                                            className="city-pill"
                                            onClick={() => {
                                                setLocation(city)
                                                setHasSearched(true)
                                                fetchWeather(city)
                                            }}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {loading && (
                            <div className="loading-screen">
                                <div className="pulse-ring" />
                                <div className="pulse-ring delay-1" />
                                <div className="pulse-ring delay-2" />
                                <p className="loading-text">Fetching weather...</p>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="error-screen">
                                <span className="error-icon">🌧️</span>
                                <p className="error-title">Couldn't find that location</p>
                                <p className="error-hint">Try: "Mumbai", "London, GB", or "28.6,77.2"</p>
                            </div>
                        )}

                        {weatherData && !loading && hasSearched && (
                            <div className="weather-grid">
                                <div className="col-left">
                                    <WeatherCard weatherData={weatherData} />
                                    <ForecastPanel forecastData={forecastData} timezone={weatherData.timezone} />
                                </div>
                                <div className="col-right">
                                    <WeatherMap
                                        lat={weatherData.coord.lat}
                                        lon={weatherData.coord.lon}
                                        cityName={weatherData.name}
                                    />
                                </div>
                            </div>
                        )}
                    </main>

                    <footer className="app-footer">
                        <p>Powered by <span>OpenWeatherMap</span> · © {new Date().getFullYear()} Nimbus</p>
                    </footer>
                </div>
            </div>
        </>
    )
}

export default App