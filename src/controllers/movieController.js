import pool from '../config/db.js';
import { scrapeMovieData } from '../services/scraperService.js';
import { getIo } from '../sockets/socketManager.js';

// Versión con 'detectives' para depuración
export const searchMovies = async (req, res) => {
  console.log('--- INICIANDO BÚSQUEDA DE PELÍCULAS ---');
  
  try {
    const { query } = req.params;
    console.log(`1. Parámetro de búsqueda recibido: "${query}"`);

    if (!query) {
      console.log('2. Error: El parámetro de búsqueda está vacío o es indefinido.');
      return res.status(400).json({ message: 'El término de búsqueda no puede estar vacío.' });
    }

    console.log('3. Intentando conectar y ejecutar la consulta a la base de datos...');
    const [results] = await pool.query('CALL sp_filtrar_pelis_por_nombre(?)', [query]);
    console.log('4. ¡Consulta a la base de datos ejecutada con éxito!');
    
    if (results && results.length > 0) {
      console.log(`5. Se encontraron ${results[0].length} película(s). Enviando respuesta.`);
      res.json(results[0]);
    } else {
      console.log('5. No se encontraron películas. Enviando array vacío.');
      res.json([]);
    }

  } catch (error) {
    console.error('--- ¡ERROR CAPTURADO! ---');
    console.error(error);
    console.error('--------------------------');
    res.status(500).json({ message: 'Error interno del servidor al buscar películas.', error: error.message });
  }
};

// ESTA ES LA FUNCIÓN QUE FALTABA
export const addReview = async (req, res) => {
  const { movieId } = req.params;
  const { userId, rating, comment } = req.body;

  try {
    const [rows] = await pool.query('CALL sp_agregar_review(?, ?, ?, ?)', [userId, movieId, rating, comment]);
    const updatedMovie = rows[0][0];
    
    getIo().emit('review_added', updatedMovie);

    res.status(201).json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar la review.', error: error.message });
  }
};

// Y ESTA TAMBIÉN
export const scrapeAndAddMovie = async (req, res) => {
    const { movieName } = req.body;
    try {
        const movieData = await scrapeMovieData(movieName);
        
        const [result] = await pool.query(
            'INSERT INTO pelis (nombre, director, anio, sinopsis, poster_url) VALUES (?, ?, ?, ?, ?)',
            [movieData.nombre, movieData.director, movieData.anio, movieData.sinopsis, movieData.poster_url]
        );
        
        res.status(201).json({ message: 'Película agregada desde scraping.', data: movieData });
    } catch (error) {
        res.status(500).json({ message: 'Error en el proceso de scraping.', error: error.message });
    }
}