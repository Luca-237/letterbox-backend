import React from 'react';
import { Link } from 'react-router-dom'; // <-- 1. Importar Link

function MovieCard({ movie }) {
  const poster = movie.poster_url || 'https://via.placeholder.com/200x300.png?text=No+Image';

  // 2. Envolvemos todo en un componente Link
  return (
    <Link to={`/movie/${movie.id}`} className="movie-card-link">
      <div className="movie-card">
        <img src={poster} alt={`Póster de ${movie.nombre}`} />
        <div className="movie-info">
          <h3>{movie.nombre}</h3>
          <p>{movie.director} - {movie.anio}</p>
          <span>⭐ {parseFloat(movie.puntuacion_promedio).toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}

export default MovieCard;