import '../styles/ForecastPanel.css'

const ForecastPanel = ({ forecastData, timezone }) => {
    if (!forecastData?.list) return null

    const dailyMap = {}
    forecastData.list.forEach(item => {
        const utc = item.dt * 1000
        const offset = timezone * 1000
        const local = new Date(utc + offset + new Date().getTimezoneOffset() * 60000)
        const dayKey = local.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        const hour = local.getHours()

        if (!dailyMap[dayKey]) {
            dailyMap[dayKey] = { ...item, dayKey, hour }
        } else {
            const prevDiff = Math.abs(dailyMap[dayKey].hour - 12)
            const curDiff = Math.abs(hour - 12)
            if (curDiff < prevDiff) {
                dailyMap[dayKey] = { ...item, dayKey, hour }
            }
        }
    })

    const days = Object.values(dailyMap).slice(0, 5)
    const hourly = forecastData.list.slice(0, 8)

    const fmtHour = (ts) => {
        const utc = ts * 1000
        const offset = timezone * 1000
        const local = new Date(utc + offset + new Date().getTimezoneOffset() * 60000)
        return local.toLocaleTimeString([], { hour: '2-digit', hour12: true })
    }

    return (
        <div className="forecast-panel">
            <section className="forecast-section">
                <h3 className="section-title">Next 24 Hours</h3>
                <div className="hourly-strip">
                    {hourly.map((item, i) => (
                        <div className="hourly-item" key={i}>
                            <span className="h-time">{i === 0 ? 'Now' : fmtHour(item.dt)}</span>
                            <img
                                src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                                alt={item.weather[0].description}
                                className="h-icon"
                            />
                            <span className="h-temp">{Math.round(item.main.temp)}°</span>
                            {item.pop > 0 && (
                                <span className="h-pop">💧 {Math.round(item.pop * 100)}%</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section className="forecast-section">
                <h3 className="section-title">5-Day Forecast</h3>
                <div className="daily-list">
                    {days.map((day, i) => (
                        <div className="daily-row" key={i}>
                            <span className="d-day">{i === 0 ? 'Today' : day.dayKey.split(',')[0]}</span>
                            <img
                                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                                alt={day.weather[0].description}
                                className="d-icon"
                            />
                            <span className="d-desc">{day.weather[0].description}</span>
                            <div className="d-temps">
                                <span className="d-high">{Math.round(day.main.temp_max)}°</span>
                                <div className="temp-bar-track">
                                    <div
                                        className="temp-bar-fill"
                                        style={{
                                            width: `${Math.min(100, Math.max(20, ((day.main.temp - 0) / 45) * 100))}%`
                                        }}
                                    />
                                </div>
                                <span className="d-low">{Math.round(day.main.temp_min)}°</span>
                            </div>
                            {day.pop > 0 && (
                                <span className="d-pop">💧 {Math.round(day.pop * 100)}%</span>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default ForecastPanel