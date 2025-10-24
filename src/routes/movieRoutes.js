import { Router } from 'express';
import { searchMovies, addReview, scrapeAndAddMovie, getAllMovies } from '../controllers/movieController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Rutas públicas
router.get('/all', getAllMovies); // Obtener todas las películas
router.get('/search/:query', searchMovies); // Buscar películas

// Rutas que requieren autenticación
router.post('/:movieId/reviews', authenticateToken, addReview); // Agregar reseña
router.post('/scrape', authenticateToken, scrapeAndAddMovie); // Scraping (requiere auth)

export default router;