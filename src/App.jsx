import { useState, useEffect } from 'react'
import './styles/App.css'
import './styles/theme.css'
import './styles/WeatherCard.css'
import WeatherCard from './components/WeatherCard'
import SearchBar from './components/SearchBar'
import ThemeToggle from './components/ThemeToggle'
import useWeather from './hooks/useWeather'

function App() {
    const [location, setLocation] = useState('Bengaluru')
    const { weatherData, loading, error, fetchWeather } = useWeather()
    const [backgroundClass, setBackgroundClass] = useState('')
    
    useEffect(() => {
        if (!weatherData) return;
    
        const weatherCondition = weatherData.weather[0].main.toLowerCase();
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const localTime = new Date(utc + (weatherData.timezone * 1000));
        const hours = localTime.getHours();
        const isNightTime = hours < 6 || hours >= 18;
        const temp = weatherData.main.temp;
    
        // Create the new class string
        const newClass = [
            isNightTime ? 'night' : 'day',
            weatherCondition,
            temp > 30 ? 'hot' : temp < 10 ? 'cold' : ''
        ].filter(Boolean).join(' ');
    
        // Only update if the class has changed
        if (newClass !== backgroundClass) {
            // First remove all weather-related classes
            document.body.classList.remove(
                'day', 'night', 'clear', 'clouds', 'rain', 
                'thunderstorm', 'snow', 'hot', 'cold'
            );
            
            // Then add the new classes
            newClass.split(' ').forEach(cls => document.body.classList.add(cls));
            
            setBackgroundClass(newClass);
        }
    }, [weatherData]);

    const handleSearch = async (e) => {
        e.preventDefault()
        if (location.trim()) {
            await fetchWeather(location)
        }
    }

    return (
        <div className="app-container">
            <header className="header-container">
                <h1 className="app-title">Weather Forecast</h1>
                <div className="controls-container">
                    <div className="search-toggle-container">
                        <SearchBar 
                            location={location}
                            setLocation={setLocation}
                            handleSearch={handleSearch}
                        />
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            
            <main className="weather-main">
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading weather data...</p>
                    </div>
                )}
                
                {error && (
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <p>Try these formats:</p>
                        <ul className="suggestions-list">
                            <li>"Bengaluru, IN"</li>
                            <li>"Mumbai"</li>
                            <li>Lat/Long: "12.9716,77.5946"</li>
                        </ul>
                    </div>
                )}
                
                {weatherData && (
                    <WeatherCard 
                        weatherData={weatherData} 
                        error={error}
                    />
                )}
            </main>
            
            <footer className="app-footer">
                <p>© {new Date().getFullYear()} Weather App - Powered by OpenWeatherMap</p>
            </footer>
        </div>
    )
}

export default App