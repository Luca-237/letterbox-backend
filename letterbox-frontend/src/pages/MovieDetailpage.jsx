import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, addMovieReview } from '../services/api';
import { useAuth } from '../context/UserContext';
import './MovieDetailPage.css'; // Crearemos este archivo para estilos

function MovieDetailPage() {
  const { movieId } = useParams(); // Obtiene el ID de la URL
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0); // Puntuación seleccionada (1-5)
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Efecto para cargar los detalles de la película
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getMovieById(movieId);
        if (response.data.success) {
          setMovie(response.data.data);
        } else {
          setError('No se pudo cargar la película.');
        }
      } catch (err) {
        setError('Error al buscar la película. Puede que no exista.');
        console.error('Error fetching movie:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieId]); // Se ejecuta cada vez que cambia el movieId

  // Manejar envío de la review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      setSubmitError('Debes iniciar sesión para dejar una reseña.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setSubmitError('Por favor, selecciona una puntuación entre 1 y 5.');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');

    try {
      const reviewData = { rating, comment };
      const response = await addMovieReview(movieId, reviewData);
      if (response.data.success) {
        // Opcional: Actualizar la película localmente o recargar
        // Por simplicidad, podrías mostrar un mensaje de éxito
        alert('Reseña añadida con éxito!');
        setRating(0); // Resetear formulario
        setComment('');
        // Podrías recargar los datos de la peli si quieres ver el promedio actualizado al instante
        // fetchMovie(); // Descomenta si quieres recargar
      } else {
        setSubmitError('Hubo un error al guardar la reseña.');
      }
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error al enviar la reseña.');
      console.error('Error submitting review:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Renderizado condicional
  if (loading) return <div className="loading-message">Cargando película...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!movie) return <div className="error-message">Película no encontrada.</div>;

  // --- Renderizado de Estrellas ---
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((starValue) => (
      <span
        key={starValue}
        className={`star ${starValue <= rating ? 'selected' : ''}`}
        onClick={() => !submitLoading && setRating(starValue)} // Permite clickear
      >
        ★
      </span>
    ));
  };


  return (
    <div className="movie-detail-page">
      <button onClick={() => navigate(-1)} className="back-button">← Volver</button>
      <div className="movie-detail-content">
        <div className="movie-detail-poster">
          <img src={movie.poster_url || 'url_imagen_por_defecto.png'} alt={`Poster de ${movie.nombre}`} />
        </div>
        <div className="movie-detail-info">
          <h1>{movie.nombre} ({movie.anio})</h1>
          <p className="director">Dirigida por: {movie.director || 'Desconocido'}</p>
          <div className="movie-rating-display">
            Puntuación Promedio: ⭐ {parseFloat(movie.puntuacion_promedio).toFixed(1)}
          </div>
          <h2>Sinopsis</h2>
          <p>{movie.sinopsis || 'Sinopsis no disponible.'}</p>

          {/* --- Sección para Añadir Review --- */}
          {isAuthenticated() ? (
            <div className="add-review-section">
              <h3>Deja tu reseña, {currentUser?.username}!</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="rating-input">
                  <label>Tu Puntuación:</label>
                  <div className="stars-container">
                    {renderStars()}
                  </div>
                </div>
                <div className="comment-input">
                  <label htmlFor="comment">Comentario (opcional):</label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="¿Qué te pareció la película?"
                    rows="4"
                    disabled={submitLoading}
                  />
                </div>
                {submitError && <p className="error-message">{submitError}</p>}
                <button type="submit" className="submit-review-button" disabled={submitLoading}>
                  {submitLoading ? 'Enviando...' : 'Enviar Reseña'}
                </button>
              </form>
            </div>
          ) : (
            <p className="login-prompt">
              <button onClick={() => navigate('/')} className="login-button-inline">Inicia sesión</button> para dejar tu reseña.
            </p>
          )}

           {/* --- Aquí podrías añadir una sección para mostrar reviews existentes --- */}
           {/* <div className="existing-reviews">
             <h3>Reseñas de otros usuarios</h3>
             {/* Lógica para cargar y mostrar reviews */}
           {/*</div> */}

        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;