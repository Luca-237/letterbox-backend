import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function MovieCard({ movie }) {
  const [imageError, setImageError] = useState(false);
  const poster = movie.poster_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMkMzNDQwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWFiIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
  const defaultPoster = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMkMzNDQwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWFiIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';

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
              {movie.puntuacion_promedio ? parseFloat(movie.puntuacion_promedio).toFixed(1) : 'N/A'}
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
