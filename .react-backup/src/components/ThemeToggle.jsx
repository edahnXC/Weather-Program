import { useState, useEffect } from 'react'
import '../styles/ThemeToggle.css'

const ThemeToggle = () => {
    const [dark, setDark] = useState(
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    )

    useEffect(() => {
        document.body.dataset.theme = dark ? 'dark' : 'light'
        localStorage.setItem('theme', dark ? 'dark' : 'light')
    }, [dark])

    return (
        <button className="theme-btn" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            <span className="theme-track">
                <span className={`theme-thumb ${dark ? 'dark' : 'light'}`}>
                    {dark ? '🌙' : '☀️'}
                </span>
            </span>
            <span className="theme-label">{dark ? 'Dark' : 'Light'}</span>
        </button>
    )
}

export default ThemeToggle