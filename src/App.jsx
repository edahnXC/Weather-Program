import { useState, useEffect } from 'react'
import WeatherCard from './components/WeatherCard'
import ForecastPanel from './components/ForecastPanel'
import SearchBar from './components/SearchBar'
import ThemeToggle from './components/ThemeToggle'
import useWeather from './hooks/useWeather'
import './styles/App.css'
import './styles/theme.css'

function App() {
    const [location, setLocation] = useState('')
    const { weatherData, forecastData, loading, error, fetchWeather } = useWeather()
    const [hasSearched, setHasSearched] = useState(false)

    useEffect(() => {
        if (!weatherData) return
        const condition = weatherData.weather[0].main.toLowerCase()
        const now = new Date()
        const utc = now.getTime() + now.getTimezoneOffset() * 60000
        const localTime = new Date(utc + weatherData.timezone * 1000)
        const hours = localTime.getHours()
        const isNight = hours < 6 || hours >= 19
        const temp = weatherData.main.temp

        document.body.className = [
            isNight ? 'night' : 'day',
            condition,
            temp > 30 ? 'hot' : temp < 10 ? 'cold' : ''
        ].filter(Boolean).join(' ')
    }, [weatherData])

    const handleSearch = async (e, searchLocation) => {
        e.preventDefault()
        const loc = searchLocation || location.trim()
        if (loc) {
            setHasSearched(true)
            await fetchWeather(loc)
        }
    }

    return (
        <div className="app-wrapper">
            <div className="app-container">
                <header className="app-header">
                    <div className="brand">
                        <span className="brand-icon">⛅</span>
                        <h1 className="brand-title">Nimbus</h1>
                    </div>
                    <div className="header-controls">
                        <SearchBar
                            location={location}
                            setLocation={setLocation}
                            handleSearch={handleSearch}
                        />
                        <ThemeToggle />
                    </div>
                </header>

                <main className="app-main">
                    {!hasSearched && !loading && (
                        <div className="welcome-screen">
                            <div className="welcome-orb" />
                            <h2 className="welcome-title">Real-time weather,<br />anywhere on Earth.</h2>
                            <p className="welcome-sub">Search a city to get started</p>
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

                    {weatherData && !loading && (
                        <div className="weather-layout">
                            <WeatherCard weatherData={weatherData} />
                            {forecastData && <ForecastPanel forecastData={forecastData} timezone={weatherData.timezone} />}
                        </div>
                    )}
                </main>

                <footer className="app-footer">
                    <p>Powered by <span>OpenWeatherMap</span> · © {new Date().getFullYear()} Nimbus</p>
                </footer>
            </div>
        </div>
    )
}

export default App