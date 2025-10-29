import { Router } from 'express';
import { searchMovies, addReview, scrapeAndAddMovie, getAllMovies, getMovieById } from '../controllers/movieController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/all', getAllMovies); 
router.get('/search/:query', searchMovies); 
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});
router.get('/:movieId', (req, res) => {
  console.log(`🔍 Ruta /:movieId capturada con ID: ${req.params.movieId}`);
  getMovieById(req, res);
}); 

router.post('/:movieId/reviews', authenticateToken, addReview);
router.post('/scrape', authenticateToken, scrapeAndAddMovie); 

export default router;
