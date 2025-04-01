import { useState } from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ location, setLocation, handleSearch }) => {
  const [inputValue, setInputValue] = useState(location);
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSearching) return;
    
    const formattedLocation = inputValue.trim();
    
    if (!formattedLocation) {
      setError('Please enter a city name');
      return;
    }
    
    if (/[अ-ह]/.test(formattedLocation)) {
      setError('Please use English city names');
      return;
    }
    
    setError(null);
    setLocation(formattedLocation);
    setIsSearching(true);
    
    try {
      await handleSearch(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-container">
      <div className="search-group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          placeholder="Search city..."
          className="search-input"
          aria-label="City search input"
        />
        <button 
          type="submit" 
          className="search-button" 
          aria-label="Search"
          disabled={isSearching}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
      
      {error && <p className="input-error">{error}</p>}
    </form>
  );
};

export default SearchBar;