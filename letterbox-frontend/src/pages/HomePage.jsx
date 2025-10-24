import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import MovieList from '../components/MovieList';
import AuthModal from '../components/AuthModal';
import { searchMovies, getAllMovies } from '../services/api';
import { useAuth } from '../context/UserContext';

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { currentUser, logout, isAuthenticated } = useAuth();

  // Cargar películas al inicio
  useEffect(() => {
    loadAllMovies();
  }, []);

  const loadAllMovies = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllMovies();
      
      // Manejar la nueva estructura de respuesta
      if (response.data.success && Array.isArray(response.data.data)) {
        setMovies(response.data.data);
      } else {
        console.error('Respuesta inesperada:', response.data);
        setError('Error al cargar las películas');
      }
    } catch (err) {
      setError('No se pudieron cargar las películas. Intenta de nuevo.');
      console.error('Error al cargar películas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Esta función se la pasaremos al SearchBar
  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setError('');
      const response = await searchMovies(query);
      
      // Manejar la nueva estructura de respuesta
      if (response.data.success && Array.isArray(response.data.data)) {
        setMovies(response.data.data);
      } else {
        console.error('Respuesta de búsqueda inesperada:', response.data);
        setError('Error en la búsqueda');
      }
    } catch (err) {
      setError('No se pudieron encontrar películas. Intenta de nuevo.');
      console.error('Error en búsqueda:', err);
    } finally {
      setLoading(false);
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
        {error && <p className="error-message">{error}</p>}
      </header>
      <main>
        <MovieList 
          movies={movies} 
          loading={loading} 
          title={movies.length > 0 ? "Películas" : "Todas las Películas"}
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