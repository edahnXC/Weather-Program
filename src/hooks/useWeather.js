import { useState } from 'react'

const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = async (location, unit = 'metric') => {
    setLoading(true)
    setError(null)
    
    try {
      // First try with exact input
      let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=${unit}&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
      
      let response = await fetch(apiUrl)
      
      // If 404, try with country code
      if (!response.ok) {
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},IN&units=${unit}&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
        response = await fetch(apiUrl)
      }
      
      // If still error, try with coordinates if input is in lat,lon format
      if (!response.ok && location.includes(',')) {
        const [lat, lon] = location.split(',').map(coord => coord.trim())
        if (!isNaN(lat) && !isNaN(lon)) {
          apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
          response = await fetch(apiUrl)
        }
      }
      
      if (!response.ok) {
        throw new Error(`Couldn't find weather for "${location}"`)
      }
      
      const data = await response.json()
      setWeatherData(data)
    } catch (err) {
      setError(err.message)
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  return { weatherData, loading, error, fetchWeather }
}

export default useWeather