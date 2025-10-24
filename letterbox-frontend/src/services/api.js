import axios from 'axios';

// 1. CREACIÓN DE LA INSTANCIA DE AXIOS
const apiClient = axios.create({
  baseURL: 'http://localhost:3003/api', // La URL base de tu backend
});

// 2. INTERCEPTOR DE PETICIONES
// Se ejecuta ANTES de que cada petición sea enviada.
apiClient.interceptors.request.use(
  (config) => {
    // Obtenemos el token del localStorage (donde lo guardaremos después del login)
    const token = localStorage.getItem('token');

    // Si el token existe, lo añadimos a las cabeceras de la petición
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Si hay un error, lo rechazamos
    return Promise.reject(error);
  }
);

// 3. DEFINICIÓN DE LAS FUNCIONES DE LA API

// --- Autenticación ---
export const loginUser = (credentials) => {
  return apiClient.post('/users/login', credentials);
};

export const registerUser = (userData) => {
  return apiClient.post('/users/register', userData);
};

// --- Películas ---
export const searchMovies = (query) => {
  return apiClient.get(`/movies/search/${query}`);
};

// Obtener todas las películas
export const getAllMovies = () => {
  return apiClient.get('/movies/all');
};

// Función nueva para obtener los detalles de UNA película (necesaria para la página de detalles)
export const getMovieById = (movieId) => {
  return apiClient.get(`/movies/${movieId}`); // Ahora esta ruta SÍ existe en el backend
};

// --- Reviews ---
// --- CORRECCIÓN ---
// Fíjate que ya no pasamos el 'userId'. El backend lo sabrá gracias al token.
export const addMovieReview = (movieId, reviewData) => {
  // reviewData sería un objeto como { rating: 5, comment: '¡Genial!' }
  return apiClient.post(`/movies/${movieId}/reviews`, reviewData);
};