import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import MovieList from '../components/MovieList';
import { searchMovies } from '../services/api'; // Importamos la función de la API

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');

  // Esta función se la pasaremos al SearchBar
  const handleSearch = async (query) => {
    try {
      setError('');
      const response = await searchMovies(query);
      setMovies(response.data);
    } catch (err) {
      setError('No se pudieron encontrar películas. Intenta de nuevo.');
      console.error(err);
    }
  };

  return (
    <div className="home-page">
      <header>
        <h1>🎬 Letterboxd Clone</h1>
        <SearchBar onSearch={handleSearch} />
        {error && <p className="error-message">{error}</p>}
      </header>
      <main>
        <MovieList movies={movies} />
      </main>
    </div>
  );
}

export default HomePage;