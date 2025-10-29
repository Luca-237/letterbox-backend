import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Busca una película..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="search-button">Buscar</button>
    </form>
  );
}

export default SearchBar;
