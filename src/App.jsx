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
  const [unit, setUnit] = useState('metric')
  const { weatherData, loading, error, fetchWeather } = useWeather()
  
  useEffect(() => {
    fetchWeather(location, unit)
  }, []) // Initial fetch

  useEffect(() => {
    if (location) {
      fetchWeather(location, unit)
    }
  }, [unit]) // Refetch when unit changes

  useEffect(() => {
    if (!weatherData) return
    
    const weatherCondition = weatherData.weather[0].main.toLowerCase()
    const now = new Date()
    const hours = now.getHours()
    const isNightTime = hours < 6 || hours > 18
    
    document.body.classList.remove(
      'day', 'night', 'clear', 'clouds', 'rain', 
      'thunderstorm', 'snow', 'hot', 'cold'
    )
    
    document.body.classList.add(isNightTime ? 'night' : 'day')
    document.body.classList.add(weatherCondition)
    
    const temp = weatherData.main.temp
    if (temp > 30) document.body.classList.add('hot')
    else if (temp < 10) document.body.classList.add('cold')
  }, [weatherData])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (location.trim()) {
      await fetchWeather(location, unit)
    }
  }

  return (
    <div className="app-container">
      <header className="header-container">
        <h1 className="app-title">Weather Forecast</h1>
        <div className="controls-container">
          <SearchBar 
            location={location}
            setLocation={setLocation}
            unit={unit}
            setUnit={setUnit}
            handleSearch={handleSearch}
          />
          <ThemeToggle />
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
            unit={unit} 
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