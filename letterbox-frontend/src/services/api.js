import axios from 'axios';

const BACKEND_HOST = window.location.hostname; 
const BACKEND_PORT = 3003; 

const apiClient = axios.create({
  baseURL: `http://${BACKEND_HOST}:${BACKEND_PORT}/api`, 
});

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

export const loginUser = (credentials) => {
  return apiClient.post('/users/login', credentials);
};

export const registerUser = (userData) => {
  return apiClient.post('/users/register', userData);
};

export const searchMovies = (query) => {
  return apiClient.get(`/movies/search/${query}`);
};

export const getAllMovies = () => {
  return apiClient.get('/movies/all');
};

export const getMovieById = (movieId) => {
  return apiClient.get(`/movies/${movieId}`);
};

export const addMovieReview = (movieId, reviewData) => {
  return apiClient.post(`/movies/${movieId}/reviews`, reviewData);
};

export const scrapeAndAddMovieApi = (movieName) => {
  return apiClient.post('/movies/scrape', { movieName });
};
