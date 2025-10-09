import React from 'react';
import MovieCard from './MovieCard';

// Recibe una lista de películas y las renderiza
function MovieList({ movies }) {
  if (movies.length === 0) {
    return <p className="no-results">Busca algo para empezar...</p>;
  }

  return (
    <div className="movie-list">
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}

export default MovieList;