import { useState } from 'react'
import '../styles/SearchBar.css'

const SearchBar = ({ location, setLocation, handleSearch }) => {
    const [input, setInput] = useState(location)
    const [busy, setBusy] = useState(false)
    const [err, setErr] = useState(null)

    const onSubmit = async (e) => {
        e.preventDefault()
        if (busy) return
        const val = input.trim()
        if (!val) { setErr('Enter a city name'); return }
        if (/[अ-ह]/.test(val)) { setErr('Please use English city names'); return }
        setErr(null)
        setBusy(true)
        try {
            await handleSearch(e, val)
            setLocation(val)
        } finally {
            setBusy(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="search-form">
            <div className="search-wrap">
                <svg className="search-icon-left" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                    type="text"
                    value={input}
                    onChange={e => { setInput(e.target.value); setErr(null) }}
                    placeholder="Search city..."
                    className="search-input"
                    aria-label="Search city"
                />
                <button type="submit" className="search-btn" disabled={busy} aria-label="Search">
                    {busy ? <span className="btn-spinner" /> : 'Go'}
                </button>
            </div>
            {err && <p className="search-err">{err}</p>}
        </form>
    )
}

export default SearchBar