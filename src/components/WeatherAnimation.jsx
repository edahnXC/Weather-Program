import '../styles/WeatherAnimation.css'

const getCondition = () => {
    const classes = document.body.classList
    if (classes.contains('thunderstorm')) return 'thunderstorm'
    if (classes.contains('rain') || classes.contains('drizzle')) return 'rain'
    if (classes.contains('snow')) return 'snow'
    if (classes.contains('mist') || classes.contains('fog') || classes.contains('haze')) return 'mist'
    if (classes.contains('clouds')) return 'clouds'
    if (classes.contains('hot')) return 'hot'
    if (classes.contains('clear')) return 'clear'
    return null
}

const COUNTS = {
    rain:        45,
    thunderstorm: 35,
    snow:        35,
    mist:        10,
    clouds:       8,
    clear:       12,
    hot:         14,
}

const WeatherAnimation = ({ condition }) => {
    const type = getCondition()
    if (!type) return null

    const count = COUNTS[type] || 0

    // Pre-generate stable random values
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        delay:    `${(i * 0.37 % 5).toFixed(2)}s`,
        duration: `${((i * 0.53 % 3) + 2.5).toFixed(2)}s`,
        left:     `${((i * 7.3 + 3) % 100).toFixed(2)}%`,
        size:     `${((i * 0.17 % 0.6) + 0.5).toFixed(2)}`,
        drift:    `${((i * 11.7 % 40) - 20).toFixed(2)}px`,
    }))

    return (
        <div className={`weather-animation weather-animation--${type}`} aria-hidden="true">
            {particles.map(p => (
                <span
                    key={p.id}
                    className="particle"
                    style={{
                        '--delay':    p.delay,
                        '--duration': p.duration,
                        '--left':     p.left,
                        '--size':     p.size,
                        '--drift':    p.drift,
                    }}
                />
            ))}
            {type === 'thunderstorm' && <div className="lightning" />}
        </div>
    )
}

export default WeatherAnimation