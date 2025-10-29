import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import MovieList from '../components/MovieList';
import AuthModal from '../components/AuthModal';
import { searchMovies, getAllMovies, scrapeAndAddMovieApi } from '../services/api';
import { useAuth } from '../context/UserContext';

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser, logout, isAuthenticated } = useAuth(); 

  const [addMovieName, setAddMovieName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addMessage, setAddMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadAllMovies();
  }, []);

  const loadAllMovies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllMovies();
      if (response.data.success && Array.isArray(response.data.data)) {
        setMovies(response.data.data);
      } else {
        setError('Error al cargar las películas');
      }
    } catch (err) {
      setError('No se pudieron cargar las películas. Intenta de nuevo.');
      console.error('Error al cargar películas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setError('');
      const response = await searchMovies(query);
      if (response.data.success && Array.isArray(response.data.data)) {
        setMovies(response.data.data);
      } else {
        setError('Error en la búsqueda');
      }
    } catch (err) {
      setError('No se pudieron encontrar películas. Intenta de nuevo.');
      console.error('Error en búsqueda:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMovieSubmit = async (e) => {
    e.preventDefault();
    if (!addMovieName.trim()) {
      setAddMessage({ type: 'error', text: 'Ingresa un nombre de película.' });
      return;
    }
    if (!isAuthenticated()) {
      setAddMessage({ type: 'error', text: 'Debes iniciar sesión para añadir películas.' });
      setShowAuthModal(true);
      return; 
    }

    setAddLoading(true);
    setAddMessage({ type: '', text: '' });

    try {
      const response = await scrapeAndAddMovieApi(addMovieName);

      if (response.data.success) {
        setAddMessage({ type: 'success', text: response.data.message });
        setAddMovieName('');
        await loadAllMovies();
      } else {
        setAddMessage({ type: 'error', text: response.data.message || 'Error al añadir la película.' });
      }
    } catch (err) {
      console.error('Error al añadir película:', err);
      setAddMessage({ type: 'error', text: err.response?.data?.message || 'Error de conexión o del servidor.' });
    } finally {
      setAddLoading(false);
      setTimeout(() => setAddMessage({ type: '', text: '' }), 5000);
    }
  };

  return (
    <div className="home-page">
      <header>
        <div className="header-content">
          <h1>🎬 Letterboxd Clone</h1>
          <div className="user-section">
            {isAuthenticated() ? (
              <div className="user-info">
                <span>Hola, {currentUser?.username}</span>
                <button onClick={logout} className="logout-button">
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="login-button"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
        <SearchBar onSearch={handleSearch} />

        {}
        {}
        <div className="add-movie-section">
          <h3>Añadir Película desde IMDb</h3>
          <form onSubmit={handleAddMovieSubmit} className="add-movie-form">
            <input
              type="text"
              className="add-movie-input"
              placeholder="Nombre exacto de la película en IMDb..."
              value={addMovieName}
              onChange={(e) => setAddMovieName(e.target.value)}
              disabled={addLoading}
            />
            <button type="submit" className="add-movie-button" disabled={addLoading}>
              {addLoading ? 'Buscando y Añadiendo...' : 'Añadir Película'}
            </button>
          </form>
          {addMessage.text && (
            <p className={`add-movie-message ${addMessage.type}`}>
              {addMessage.text}
            </p>
          )}
        </div>
        {}
        {}

        {error && <p className="error-message">{error}</p>}
      </header>
      <main>
        <MovieList
          movies={movies}
          loading={loading}
          title={error ? "Error" : (movies.length > 0 ? "Películas Encontradas" : "Todas las Películas")}
        />
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}

export default HomePage;
