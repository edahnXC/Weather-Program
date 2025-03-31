import { useState, useEffect } from 'react'
import '../styles/ThemeToggle.css'

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  )

  useEffect(() => {
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(isDarkMode ? 'dark' : 'light')
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <button onClick={toggleTheme} className="theme-toggle-button">
      <span className="theme-icon">
        {isDarkMode ? '☀️' : '🌙'}
      </span>
      <span className="theme-text">
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  )
}

export default ThemeToggle