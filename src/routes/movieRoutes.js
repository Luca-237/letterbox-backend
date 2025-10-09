import { Router } from 'express';
import { searchMovies, addReview, scrapeAndAddMovie } from '../controllers/movieController.js';

const router = Router();
router.get('/search/:query', searchMovies);
router.post('/:movieId/reviews', addReview);
router.post('/scrape', scrapeAndAddMovie); // Ruta para el scraping

export default router;