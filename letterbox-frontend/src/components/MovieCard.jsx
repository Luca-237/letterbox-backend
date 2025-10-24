import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function MovieCard({ movie }) {
  const [imageError, setImageError] = useState(false);
  const poster = movie.poster_url || 'https://via.placeholder.com/200x300.png?text=No+Image';
  const defaultPoster = 'https://via.placeholder.com/200x300.png?text=No+Image';

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link to={`/movie/${movie.id}`} className="movie-card-link">
      <div className="movie-card">
        <div className="poster-container">
          <img 
            src={imageError ? defaultPoster : poster} 
            alt={`Póster de ${movie.nombre}`}
            onError={handleImageError}
            loading="lazy"
          />
          <div className="movie-overlay">
            <div className="movie-rating">
              ⭐ {movie.puntuacion_promedio ? parseFloat(movie.puntuacion_promedio).toFixed(1) : 'N/A'}
            </div>
          </div>
        </div>
        <div className="movie-info">
          <h3 className="movie-title" title={movie.nombre}>
            {movie.nombre}
          </h3>
          <p className="movie-details">
            {movie.director && movie.anio ? `${movie.director} • ${movie.anio}` : 'Información no disponible'}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;