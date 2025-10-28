import axios from 'axios';

// Dynamically determine the backend host based on how the frontend is accessed
const BACKEND_HOST = window.location.hostname; // Gets the hostname/IP from the browser's address bar
const BACKEND_PORT = 3003; // Keep your backend port consistent

// 1. CREACIÓN DE LA INSTANCIA DE AXIOS
const apiClient = axios.create({
  baseURL: `http://${BACKEND_HOST}:${BACKEND_PORT}/api`, // Use the dynamic host
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
export const scrapeAndAddMovieApi = (movieName) => {
  return apiClient.post('/movies/scrape', { movieName });
};