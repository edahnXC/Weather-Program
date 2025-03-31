import { useState } from 'react'

const useWeather = () => {
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchWeather = async (location, unit = 'metric') => {
    setLoading(true)
    setError(null)
    
    try {
      let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=${unit}&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
      
      let response = await fetch(apiUrl)
      let data = await response.json()
      
      if (data.cod === '404') {
        // Try with country code if first attempt fails
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},IN&units=${unit}&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
        response = await fetch(apiUrl)
        data = await response.json()
      }
      
      if (data.cod === '404' && location.includes(',')) {
        const [lat, lon] = location.split(',').map(coord => coord.trim())
        if (!isNaN(lat) && !isNaN(lon)) {
          apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${import.meta.env.VITE_WEATHER_API_KEY}`
          response = await fetch(apiUrl)
          data = await response.json()
        }
      }
      
      if (data.cod && data.cod !== 200) {
        throw new Error(data.message || `Couldn't find weather for "${location}"`)
      }
      
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