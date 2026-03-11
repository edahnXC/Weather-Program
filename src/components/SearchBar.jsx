import { useState, useRef, useEffect } from 'react'
import '../styles/SearchBar.css'

const SearchBar = ({ location, setLocation, handleSearch }) => {
    const [suggestions, setSuggestions]   = useState([])
    const [showDrop, setShowDrop]         = useState(false)
    const [highlighted, setHighlighted]   = useState(-1)
    const [busy, setBusy]                 = useState(false)
    const debounceRef = useRef(null)
    const wrapRef     = useRef(null)
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY

    /* ── fetch suggestions ───────────────────────────── */
    const fetchSuggestions = (query) => {
        clearTimeout(debounceRef.current)
        if (query.trim().length < 2) {
            setSuggestions([])
            setShowDrop(false)
            return
        }
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=6&appid=${apiKey}`
                )
                const data = await res.json()
                // Deduplicate by city+country
                const seen = new Set()
                const unique = data.filter(c => {
                    const key = `${c.name}-${c.country}-${c.state || ''}`
                    if (seen.has(key)) return false
                    seen.add(key)
                    return true
                })
                setSuggestions(unique)
                setShowDrop(unique.length > 0)
                setHighlighted(-1)
            } catch {
                setSuggestions([])
                setShowDrop(false)
            }
        }, 280)
    }

    /* ── pick a suggestion ───────────────────────────── */
    const pickSuggestion = (city) => {
        const label = city.state
            ? `${city.name}, ${city.state}, ${city.country}`
            : `${city.name}, ${city.country}`
        setLocation(label)
        setSuggestions([])
        setShowDrop(false)
        setHighlighted(-1)
        // Trigger search using lat/lon for precision
        const fakeEvent = { preventDefault: () => {} }
        handleSearch(fakeEvent, `${city.lat},${city.lon}`)
    }

    /* ── keyboard nav ────────────────────────────────── */
    const handleKeyDown = (e) => {
        if (!showDrop || suggestions.length === 0) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setHighlighted(h => Math.min(h + 1, suggestions.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setHighlighted(h => Math.max(h - 1, -1))
        } else if (e.key === 'Enter' && highlighted >= 0) {
            e.preventDefault()
            pickSuggestion(suggestions[highlighted])
        } else if (e.key === 'Escape') {
            setShowDrop(false)
            setHighlighted(-1)
        }
    }

    /* ── close on outside click ──────────────────────── */
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setShowDrop(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const handleChange = (e) => {
        setLocation(e.target.value)
        fetchSuggestions(e.target.value)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (busy || !location.trim()) return
        setShowDrop(false)
        setBusy(true)
        await handleSearch(e, location.trim())
        setBusy(false)
    }

    return (
        <div className="search-outer" ref={wrapRef}>
            <form className="search-form" onSubmit={handleSubmit} autoComplete="off">
                <div className="search-wrap">
                    <span className="search-icon">🔍</span>
                    <input
                        className="search-input"
                        type="text"
                        value={location}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => suggestions.length > 0 && setShowDrop(true)}
                        placeholder="Search city..."
                        aria-label="Search city"
                        aria-autocomplete="list"
                        aria-expanded={showDrop}
                        spellCheck={false}
                    />
                    {location && (
                        <button
                            type="button"
                            className="search-clear"
                            onClick={() => {
                                setLocation('')
                                setSuggestions([])
                                setShowDrop(false)
                            }}
                            aria-label="Clear"
                        >
                            ✕
                        </button>
                    )}
                    <button className="search-btn" type="submit" disabled={busy}>
                        {busy ? <span className="search-spinner" /> : 'Search'}
                    </button>
                </div>
            </form>

            {showDrop && suggestions.length > 0 && (
                <ul className="suggestions-drop" role="listbox">
                    {suggestions.map((city, i) => (
                        <li
                            key={`${city.lat}-${city.lon}`}
                            className={`suggestion-item ${i === highlighted ? 'highlighted' : ''}`}
                            onMouseDown={() => pickSuggestion(city)}
                            onMouseEnter={() => setHighlighted(i)}
                            role="option"
                            aria-selected={i === highlighted}
                        >
                            <span className="suggestion-pin">📍</span>
                            <span className="suggestion-name">{city.name}</span>
                            <span className="suggestion-meta">
                                {city.state ? `${city.state}, ` : ''}{city.country}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default SearchBar