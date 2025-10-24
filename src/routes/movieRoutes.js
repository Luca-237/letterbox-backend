import { Router } from 'express';
// Asegúrate de importar getMovieById aquí
import { searchMovies, addReview, scrapeAndAddMovie, getAllMovies, getMovieById } from '../controllers/movieController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Rutas públicas
router.get('/all', getAllMovies); // Obtener todas las películas
router.get('/search/:query', searchMovies); // Buscar películas
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});
router.get('/:movieId', (req, res) => {
  console.log(`🔍 Ruta /:movieId capturada con ID: ${req.params.movieId}`);
  getMovieById(req, res);
}); // Obtener película por ID

// Rutas que requieren autenticación
router.post('/:movieId/reviews', authenticateToken, addReview); // Agregar reseña
router.post('/scrape', authenticateToken, scrapeAndAddMovie); // Scraping (requiere auth)

export default router;