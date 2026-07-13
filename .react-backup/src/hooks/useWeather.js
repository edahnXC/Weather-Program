import { useState } from 'react'

const useWeather = () => {
    const [weatherData, setWeatherData] = useState(null)
    const [forecastData, setForecastData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const buildUrl = (type, query, unit) => {
        const key = import.meta.env.VITE_WEATHER_API_KEY
        const base = 'https://api.openweathermap.org/data/2.5'
        return `${base}/${type}?${query}&units=${unit}&appid=${key}`
    }

    const fetchWeather = async (location, unit = 'metric') => {
        setLoading(true)
        setError(null)

        try {
            let query = `q=${encodeURIComponent(location)}`

            if (location.includes(',')) {
                const [a, b] = location.split(',').map(s => s.trim())
                if (!isNaN(a) && !isNaN(b)) {
                    query = `lat=${a}&lon=${b}`
                }
            }

            let [wRes, fRes] = await Promise.all([
                fetch(buildUrl('weather', query, unit)),
                fetch(buildUrl('forecast', query, unit))
            ])

            let [wData, fData] = await Promise.all([wRes.json(), fRes.json()])

            if (wData.cod === '404' && !location.includes(',')) {
                const indiaQuery = `q=${encodeURIComponent(location + ',IN')}`
                ;[wRes, fRes] = await Promise.all([
                    fetch(buildUrl('weather', indiaQuery, unit)),
                    fetch(buildUrl('forecast', indiaQuery, unit))
                ])
                ;[wData, fData] = await Promise.all([wRes.json(), fRes.json()])
            }

            if (wData.cod && wData.cod !== 200) {
                throw new Error(`Couldn't find "${location}"`)
            }

            setWeatherData(wData)
            setForecastData(fData)
        } catch (err) {
            setError(err.message)
            setWeatherData(null)
            setForecastData(null)
        } finally {
            setLoading(false)
        }
    }

    return { weatherData, forecastData, loading, error, fetchWeather }
}

export default useWeather