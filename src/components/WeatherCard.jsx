const WeatherCard = ({ weatherData, unit, error }) => {
    const convertTemp = (temp) => {
      return unit === 'imperial' ? (temp * 9/5) + 32 : temp;
    };
  
    const displayTemp = Math.round(convertTemp(weatherData.main.temp));
    const displayFeelsLike = Math.round(convertTemp(weatherData.main.feels_like));
    const displayHigh = Math.round(convertTemp(weatherData.main.temp_max));
    const displayLow = Math.round(convertTemp(weatherData.main.temp_min));
    
    const formatTime = (timestamp, timezone) => {
      const date = new Date(timestamp * 1000);
      const utc = date.getTime() + date.getTimezoneOffset() * 60000;
      const cityTime = new Date(utc + (timezone * 1000));
      
      return cityTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };
    
    const getLocalTime = () => {
      if (!weatherData || !weatherData.timezone) return '';
      
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const cityTime = new Date(utc + (weatherData.timezone * 1000));
      
      return cityTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    return (
      <div className="weather-card">
        <div className="weather-header">
          <div className="location-info">
            <h2>{weatherData.name}, {weatherData.sys.country}</h2>
            <p className="current-date">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
              <span className="local-time"> • {getLocalTime()}</span>
            </p>
          </div>
          <img 
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`} 
            alt={weatherData.weather[0].description}
            className="weather-icon"
          />
        </div>
      
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        
        <div className="weather-main">
          <div className="temperature-display">
            <span className="temperature-value">{displayTemp}</span>
            <span className="temperature-unit">°{unit === 'metric' ? 'C' : 'F'}</span>
          </div>
          <p className="weather-description">
            {weatherData.weather[0].description}
          </p>
          {displayHigh !== displayTemp && displayLow !== displayTemp && (
            <div className="temp-range">
              <span>H: {displayHigh}°</span>
              <span>L: {displayLow}°</span>
            </div>
          )}
        </div>
        
        <div className="weather-details">
          <div className="detail-item">
            <span>Feels Like</span>
            <span>{displayFeelsLike}°</span>
          </div>
          <div className="detail-item">
            <span>Humidity</span>
            <span>{weatherData.main.humidity}%</span>
          </div>
          <div className="detail-item">
            <span>Wind</span>
            <span>
              {unit === 'metric' 
                ? `${weatherData.wind.speed} m/s` 
                : `${(weatherData.wind.speed * 2.237).toFixed(1)} mph`}
            </span>
          </div>
          <div className="detail-item">
            <span>Pressure</span>
            <span>{weatherData.main.pressure} hPa</span>
          </div>
        </div>
        
        <div className="sun-times">
          <div className="sun-time">
            <span>🌅 Sunrise</span>
            <span>
              {formatTime(weatherData.sys.sunrise, weatherData.timezone)}
            </span>
          </div>
          <div className="sun-time">
            <span>🌇 Sunset</span>
            <span>
              {formatTime(weatherData.sys.sunset, weatherData.timezone)}
            </span>
          </div>
        </div>
      </div>
    );
};
export default WeatherCard;