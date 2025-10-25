import axios from 'axios';

// 1. CREACIÓN DE LA INSTANCIA DE AXIOS
const apiClient = axios.create({
  // Asegúrate que este puerto coincida con el de tu backend (ej: 3003)
  baseURL: 'http://localhost:3003/api',
});

// 2. INTERCEPTOR DE PETICIONES
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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

export const getAllMovies = () => {
  return apiClient.get('/movies/all');
};

export const getMovieById = (movieId) => {
  return apiClient.get(`/movies/${movieId}`);
};

// --- Reviews ---
export const addMovieReview = (movieId, reviewData) => {
  return apiClient.post(`/movies/${movieId}/reviews`, reviewData);
};

// --- Scraping ---
// ASEGÚRATE DE QUE ESTA FUNCIÓN ESTÉ PRESENTE Y EXPORTADA
export const scrapeAndAddMovieApi = (movieName) => {
  // Envía el nombre de la película en el cuerpo de la petición POST
  return apiClient.post('/movies/scrape', { movieName });
};