import { getDatabase } from '../config/db.js';
import { scrapeMovieData } from '../services/scraperService.js';
import { getIo } from '../sockets/socketManager.js';

/**
 * Obtiene todas las películas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getAllMovies = async (req, res) => {
  try {
    console.log('🎬 Obteniendo todas las películas');
    
    const db = getDatabase();
    const movies = await db.all('SELECT * FROM pelis ORDER BY nombre ASC');
    
    console.log(`✅ Encontradas ${movies.length} películas`);
    
    res.json({
      success: true,
      data: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('❌ Error al obtener películas:', error);
    res.status(500).json({
      message: 'Error al obtener las películas.',
      code: 'GET_MOVIES_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Busca películas por nombre
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const searchMovies = async (req, res) => {
  try {
    const { query } = req.params;
    
    // Validación de entrada
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ 
        message: 'El término de búsqueda no puede estar vacío.',
        code: 'INVALID_QUERY'
      });
    }

    // Sanitización básica
    const sanitizedQuery = query.trim().substring(0, 100); // Limitar longitud
    
    console.log(`🔍 Buscando películas: "${sanitizedQuery}"`);
    
    const db = getDatabase();
    const movies = await db.all(
      'SELECT * FROM pelis WHERE nombre LIKE ? ORDER BY nombre ASC',
      [`%${sanitizedQuery}%`]
    );
    
    console.log(`✅ Encontradas ${movies.length} película(s)`);
    
    res.json({
      success: true,
      data: movies,
      count: movies.length,
      query: sanitizedQuery
    });

  } catch (error) {
    console.error('❌ Error en búsqueda de películas:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor al buscar películas.',
      code: 'SEARCH_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Agrega una reseña a una película
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const addReview = async (req, res) => {
  try {
    const { movieId } = req.params;
    // --- CORRECCIÓN ---
    // El userId debe venir del token (req.user), no del body.
    const { rating, comment } = req.body;
    const { id: userId } = req.user; // Obtenido del middleware authenticateToken

    // Validaciones
    if (!userId || !movieId || !rating) {
      return res.status(400).json({
        message: 'userId (del token), movieId y rating son requeridos.',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'El rating debe estar entre 1 y 5.',
        code: 'INVALID_RATING'
      });
    }

    console.log(`📝 Agregando reseña para película ${movieId} por usuario ${userId}`);
    
    const db = getDatabase();
    
    // Insertar la review
    await db.run(
      'INSERT INTO reviews (usuario_id, pelicula_id, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, movieId, rating, comment || '']
    );
    
    // Obtener la película actualizada
    const updatedMovie = await db.get('SELECT * FROM pelis WHERE id = ?', [movieId]);
    
    // Notificar a todos los clientes conectados
    getIo().emit('review_added', {
      movieId,
      userId,
      rating,
      comment,
      updatedMovie
    });

    res.status(201).json({
      success: true,
      message: 'Reseña agregada exitosamente.',
      data: updatedMovie
    });
  } catch (error) {
    console.error('❌ Error al agregar reseña:', error);
    res.status(500).json({ 
      message: 'Error al agregar la reseña.',
      code: 'REVIEW_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Scraping y agregado de película desde IMDb
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const scrapeAndAddMovie = async (req, res) => {
  try {
    const { movieName } = req.body;

    // Validación
    if (!movieName || movieName.trim().length === 0) {
      return res.status(400).json({
        message: 'El nombre de la película es requerido.',
        code: 'MISSING_MOVIE_NAME'
      });
    }

    console.log(`🎬 Iniciando scraping para: "${movieName}"`);
    
    const movieData = await scrapeMovieData(movieName.trim());
    
    const db = getDatabase();
    
    // Verificar si la película ya existe
    const existing = await db.get(
      'SELECT id FROM pelis WHERE nombre = ?',
      [movieData.nombre]
    );

    if (existing) {
      return res.status(409).json({
        message: 'La película ya existe en la base de datos.',
        code: 'MOVIE_EXISTS',
        data: existing
      });
    }
    
    const result = await db.run(
      'INSERT INTO pelis (nombre, director, anio, sinopsis, poster_url) VALUES (?, ?, ?, ?, ?)',
      [movieData.nombre, movieData.director, movieData.anio, movieData.sinopsis, movieData.poster_url]
    );
    
    console.log(`✅ Película agregada con ID: ${result.insertId}`);
    
    res.status(201).json({ 
      success: true,
      message: 'Película agregada exitosamente desde scraping.',
      data: {
        id: result.insertId,
        ...movieData
      }
    });
  } catch (error) {
    console.error('❌ Error en scraping:', error);
    res.status(500).json({ 
      message: 'Error en el proceso de scraping.',
      code: 'SCRAPING_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// --- NUEVA FUNCIÓN ---
/**
 * Obtiene una película por su ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getMovieById = async (req, res) => {
  try {
    const { movieId } = req.params;
    console.log(`🎬 Obteniendo película con ID: ${movieId}`);

    const db = getDatabase();
    const movies = await db.all('SELECT * FROM pelis WHERE id = ?', [movieId]);

    if (movies.length === 0) {
      return res.status(404).json({
        message: 'Película no encontrada.',
        code: 'MOVIE_NOT_FOUND'
      });
    }

    console.log(`✅ Encontrada: ${movies[0].nombre}`);
    res.json({
      success: true,
      data: movies[0]
    });

  } catch (error) {
    console.error('❌ Error al obtener película por ID:', error);
    res.status(500).json({
      message: 'Error al obtener la película.',
      code: 'GET_MOVIE_BY_ID_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};