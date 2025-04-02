import { useState } from 'react';

const WeatherCard = ({ weatherData, error }) => {
    const [isCelsius, setIsCelsius] = useState(true);
    
    const formatTime = (timestamp, timezone) => {
      if (!timestamp || !timezone) return '';
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

    const convertTemp = (temp) => {
        return isCelsius ? Math.round(temp) : Math.round((temp * 9/5) + 32);
    };

    if (!weatherData) return null;

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
            <span className="temperature-value">{convertTemp(weatherData.main.temp)}</span>
            <span className="temperature-unit">
                °{isCelsius ? 'C' : 'F'}
                <button 
                    onClick={() => setIsCelsius(!isCelsius)} 
                    className="temp-toggle"
                    aria-label={`Switch to ${isCelsius ? 'Fahrenheit' : 'Celsius'}`}
                >
                    {isCelsius ? '°F' : '°C'}
                </button>
            </span>
          </div>
          <p className="weather-description">
            {weatherData.weather[0].description}
          </p>
        </div>
        
        <div className="weather-details">
          <div className="detail-item">
            <span>Feels Like</span>
            <span>{convertTemp(weatherData.main.feels_like)}°</span>
          </div>
          <div className="detail-item">
            <span>Humidity</span>
            <span>{weatherData.main.humidity}%</span>
          </div>
          <div className="detail-item">
            <span>Wind</span>
            <span>{weatherData.wind.speed.toFixed(1)} m/s</span>
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