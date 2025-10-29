import { getDatabase } from '../config/db.js';
import { scrapeMovieData } from '../services/scraperService.js';
import { getIo } from '../sockets/socketManager.js';


export const getAllMovies = async (req, res) => {
  try {
    console.log('[MovieController] Obteniendo todas las películas');

    const db = getDatabase();
    const movies = await db.all(
      `SELECT
         id, nombre, director, anio, poster_url,
         COALESCE(puntuacion_promedio, 0.0) as puntuacion_promedio
       FROM pelis
       ORDER BY nombre ASC`
    );

    console.log(`[MovieController] Encontradas ${movies.length} películas`);

    res.json({
      success: true,
      data: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('[MovieController] Error al obtener películas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las películas.',
      code: 'GET_MOVIES_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const searchMovies = async (req, res) => {
  try {
    const { query } = req.params;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El término de búsqueda no puede estar vacío.',
        code: 'INVALID_QUERY'
      });
    }

    const sanitizedQuery = query.trim().substring(0, 100);
    console.log(`[MovieController] Buscando películas: "${sanitizedQuery}"`);

    const db = getDatabase();
    const movies = await db.all(
      `SELECT
         id, nombre, director, anio, poster_url,
         COALESCE(puntuacion_promedio, 0.0) as puntuacion_promedio
       FROM pelis
       WHERE nombre LIKE ?
       ORDER BY nombre ASC`,
      [`%${sanitizedQuery}%`]
    );

    console.log(`[MovieController] Encontradas ${movies.length} película(s) para "${sanitizedQuery}"`);

    res.json({
      success: true,
      data: movies,
      count: movies.length,
      query: sanitizedQuery
    });

  } catch (error) {
    console.error('[MovieController] Error en búsqueda de películas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al buscar películas.',
      code: 'SEARCH_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const addReview = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado.', code: 'UNAUTHENTICATED' });
    }
    if (!movieId || isNaN(parseInt(movieId))) {
      return res.status(400).json({ success: false, message: 'ID de película inválido.', code: 'INVALID_MOVIE_ID' });
    }
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: 'El rating debe ser un número entre 1 y 5.', code: 'INVALID_RATING' });
    }
    const safeComment = comment ? comment.trim().substring(0, 1000) : '';

    console.log(`[MovieController] Agregando reseña (Rating: ${ratingNum}) para película ${movieId} por usuario ${userId}`);

    const db = getDatabase();

    const movieExists = await db.get('SELECT id FROM pelis WHERE id = ?', [movieId]);
    if (!movieExists) {
      return res.status(404).json({ success: false, message: 'Película no encontrada.', code: 'MOVIE_NOT_FOUND' });
    }

    const result = await db.run(
      `INSERT INTO reviews (usuario_id, pelicula_id, rating, comment) VALUES (?, ?, ?, ?)
       ON CONFLICT(usuario_id, pelicula_id) DO UPDATE SET rating=excluded.rating, comment=excluded.comment, created_at=CURRENT_TIMESTAMP`,
      [userId, movieId, ratingNum, safeComment]
    );
    const reviewId = result.lastID;

    const avgResult = await db.get(
      'SELECT AVG(rating) as avgRating FROM reviews WHERE pelicula_id = ?',
      [movieId]
    );
    const newAverage = avgResult?.avgRating ? parseFloat(avgResult.avgRating.toFixed(2)) : 0.0;

    await db.run('UPDATE pelis SET puntuacion_promedio = ? WHERE id = ?', [newAverage, movieId]);
    console.log(`[MovieController] Puntuación promedio actualizada para película ${movieId}: ${newAverage}`);

    const updatedMovie = await db.get(
      `SELECT id, nombre, director, anio, poster_url,
              COALESCE(puntuacion_promedio, 0.0) as puntuacion_promedio
       FROM pelis WHERE id = ?`,
      [movieId]
    );

    try {
      getIo().emit('review_added', {
        movieId,
        userId,
        rating: ratingNum,
        comment: safeComment,
        newAverageRating: newAverage,
        updatedMovie: updatedMovie
      });
      console.log(`[MovieController] Evento 'review_added' emitido para película ${movieId}`);
    } catch (socketError) {
      console.error("[MovieController] Error al emitir evento de socket (no crítico):", socketError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Reseña agregada/actualizada y promedio actualizado.',
      data: {
        reviewId: reviewId,
        updatedMovie: updatedMovie
      }
    });
  } catch (error) {
    console.error('[MovieController] Error al agregar/actualizar reseña:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ success: false, message: 'Error de restricción de base de datos.', code: 'DB_CONSTRAINT_ERROR' });
    }
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al procesar la reseña.',
      code: 'REVIEW_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const scrapeAndAddMovie = async (req, res) => {
  const { movieName } = req.body;

  if (!movieName || movieName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'El nombre de la película es requerido.',
      code: 'MISSING_MOVIE_NAME'
    });
  }

  const trimmedMovieName = movieName.trim();
  console.log(`[MovieController] Iniciando scraping y agregado para: "${trimmedMovieName}"`);

  try {
    const movieData = await scrapeMovieData(trimmedMovieName);

    console.log(`[MovieController] Datos recibidos del scraper:`, JSON.stringify(movieData, null, 2));
    console.log(`[MovieController] poster_url recibido: ${movieData?.poster_url}`);

    if (!movieData?.nombre) {
      console.error('[MovieController] El scraper no devolvió un nombre de película.');
      throw new Error('No se pudo obtener el nombre de la película del scraping.');
    }

    const db = getDatabase();

    const existing = await db.get(
      'SELECT * FROM pelis WHERE LOWER(nombre) = LOWER(?)', 
      [movieData.nombre]
    );

    if (existing) {
      console.log(`[MovieController] Película "${existing.nombre}" ya existe con ID: ${existing.id}. No se agrega.`);
      return res.status(200).json({
        success: true,
        message: 'La película ya existe en la base de datos.',
        code: 'MOVIE_ALREADY_EXISTS',
        data: existing
      });
    }

    console.log(`[MovieController] Intentando insertar película "${movieData.nombre}" con poster_url: ${movieData.poster_url}`);
    const result = await db.run(
      `INSERT INTO pelis (nombre, director, anio, sinopsis, poster_url, puntuacion_promedio)
       VALUES (?, ?, ?, ?, ?, ?)`, 
      [
        movieData.nombre,           
        movieData.director || null, 
        movieData.anio || null,      
        movieData.sinopsis || null,  
        movieData.poster_url || null,
        0.0                         
      ]
    );

    const newMovieId = result.lastID;
    if (!newMovieId) {
        console.error('[MovieController] Error: No se obtuvo lastID después del INSERT.');
        throw new Error('No se pudo obtener el ID de la película recién insertada.');
    }
    console.log(`[MovieController] Película "${movieData.nombre}" (ID: ${newMovieId}) insertada en la DB.`);


    const newMovieData = await db.get(
        `SELECT id, nombre, director, anio, poster_url, sinopsis,
                COALESCE(puntuacion_promedio, 0.0) as puntuacion_promedio
         FROM pelis WHERE id = ?`,
        [newMovieId]
    );
  
     console.log(`[MovieController] Datos recuperados de DB tras insertar:`, JSON.stringify(newMovieData, null, 2));



    try {
      getIo().emit('movie_added', newMovieData);
      console.log(`[MovieController] Evento 'movie_added' emitido para película ${newMovieId}`);
    } catch (socketError) {
      console.error("[MovieController] Error al emitir evento de socket (no crítico):", socketError.message);
    }

    
    res.status(201).json({
      success: true,
      message: 'Película agregada exitosamente desde scraping.',
      data: newMovieData
    });

  } catch (error) {
    console.error(`[MovieController] Error en scrapeAndAddMovie para "${trimmedMovieName}":`, error);
    let statusCode = 500;
    let errorCode = 'SCRAPING_ADD_ERROR';
    if (error.message.includes('No se encontró') || error.message.includes('Película no encontrada')) {
        statusCode = 404;
        errorCode = 'SCRAPING_MOVIE_NOT_FOUND';
    } else if (error.message.includes('No se pudo obtener el nombre')) {
        statusCode = 500;
        errorCode = 'SCRAPING_DATA_MISSING';
    } else if (error.code === 'SQLITE_CONSTRAINT') { 
        statusCode = 500; 
        errorCode = 'DB_INSERT_ERROR';
    }


    res.status(statusCode).json({
      success: false,

      message: error.message || 'Error en el proceso de scraping o guardado.',
      code: errorCode,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


export const getMovieById = async (req, res) => {
  try {
    const { movieId } = req.params;
    const id = parseInt(movieId);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, message: 'ID de película inválido.', code: 'INVALID_MOVIE_ID' });
    }

    console.log(`[MovieController] Obteniendo detalles de película con ID: ${id}`);

    const db = getDatabase();
    const movie = await db.get(
      `SELECT
         id, nombre, director, anio, sinopsis, poster_url,
         COALESCE(puntuacion_promedio, 0.0) as puntuacion_promedio,
         created_at
       FROM pelis
       WHERE id = ?`,
      [id]
    );

    if (!movie) {
      console.log(`[MovieController] Película con ID ${id} no encontrada.`);
      return res.status(404).json({
        success: false,
        message: 'Película no encontrada.',
        code: 'MOVIE_NOT_FOUND'
      });
    }

    console.log(`[MovieController] Detalles encontrados para: ${movie.nombre} (ID: ${movie.id})`);
    res.json({
      success: true,
      data: movie
    });

  } catch (error) {
    console.error('[MovieController] Error al obtener película por ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener la película.',
      code: 'GET_MOVIE_BY_ID_ERROR',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
