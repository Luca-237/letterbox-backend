import axios from 'axios';

// Creamos una instancia de Axios con la URL base de nuestro backend
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // La URL de tu backend
});

// Exportamos funciones para cada endpoint de la API
// Agrega estas funciones a tu api.js

export const registerUser = (userData) => {
  // userData sería { username: 'test', password: '123' }
  return apiClient.post('/users/register', userData);
};

// Necesitaremos un SP y una ruta en el backend para el login.
// Por ahora, lo dejamos preparado.
export const loginUser = (credentials) => {
  return apiClient.post('/users/login', credentials);
};
export const searchMovies = (query) => {
  return apiClient.get(`/movies/search/${query}`);
};

export const addMovieReview = (movieId, reviewData) => {
  // reviewData sería un objeto como { userId: 1, rating: 5, comment: '¡Genial!' }
  return apiClient.post(`/movies/${movieId}/reviews`, reviewData);
};

export const registerUser = (userData) => {
  // userData sería { username: 'test', password: '123' }
  return apiClient.post('/users/register', userData);
};

// Aquí agregaríamos las funciones para login, obtener detalles de una peli, etc.