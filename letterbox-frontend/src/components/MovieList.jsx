import React from 'react';
import MovieCard from './MovieCard';

// Recibe una lista de películas y las renderiza
function MovieList({ movies, loading = false, title = "Películas" }) {
  // Verificar que movies sea un array
  if (!Array.isArray(movies)) {
    console.error('MovieList: movies no es un array:', movies);
    return <p className="no-results">Error al cargar películas...</p>;
  }

  if (loading) {
    return (
      <div className="movie-grid-container">
        <h2 className="section-title">{title}</h2>
        <div className="movie-grid loading">
          <div className="loading-skeleton">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="movie-card-skeleton">
                <div className="poster-skeleton"></div>
                <div className="info-skeleton">
                  <div className="title-skeleton"></div>
                  <div className="subtitle-skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="movie-grid-container">
        <h2 className="section-title">{title}</h2>
        <p className="no-results">No se encontraron películas</p>
      </div>
    );
  }

  return (
    <div className="movie-grid-container">
      <h2 className="section-title">{title} ({movies.length})</h2>
      <div className="movie-grid">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

export default MovieList;