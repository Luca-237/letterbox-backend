import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Configuración de axios para scraping
 */
const axiosConfig = {
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
};

/**
 * Extrae datos de una película desde IMDb
 * @param {string} movieName - Nombre de la película a buscar
 * @returns {Object} Datos de la película
 */
export async function scrapeMovieData(movieName) {
  try {
    console.log(`🔍 Iniciando scraping para: "${movieName}"`);
    
    // URL de búsqueda en IMDb
    const searchUrl = `https://www.imdb.com/find?q=${encodeURIComponent(movieName)}`;
    
    // 1. Buscar la película
    const searchResponse = await axios.get(searchUrl, axiosConfig);
    let $ = cheerio.load(searchResponse.data);
    
    // Buscar el primer resultado de película
    const movieLink = $('.find-title-result a').first().attr('href');
    
    if (!movieLink) {
      throw new Error('Película no encontrada en IMDb.');
    }

    const movieUrl = `https://www.imdb.com${movieLink}`;
    console.log(`📄 Accediendo a: ${movieUrl}`);

    // 2. Obtener datos de la película
    const movieResponse = await axios.get(movieUrl, axiosConfig);
    $ = cheerio.load(movieResponse.data);

    // Extraer datos con selectores actualizados
    const title = $('[data-testid="hero__primary-text"]').text().trim() || 
                  $('h1[data-testid="hero-title-block__title"]').text().trim();
    
    const synopsis = $('[data-testid="plot-l"]').text().trim() || 
                     $('.plot_summary .summary_text').text().trim();
    
    const posterUrl = $('.ipc-image').first().attr('src') || 
                      $('.poster img').first().attr('src');
    
    const director = $('a[href*="tt_ov_dr"]').first().text().trim() || 
                    $('.credit_summary_item a').first().text().trim();
    
    const yearText = $('a[href*="releaseinfo"]').first().text().trim() || 
                    $('.title_wrapper h1').text().match(/\((\d{4})\)/)?.[1];
    
    const year = yearText ? parseInt(yearText) : null;

    // Validar datos mínimos
    if (!title) {
      throw new Error('No se pudo extraer el título de la película.');
    }

    const movieData = {
      nombre: title,
      sinopsis: synopsis || 'Sinopsis no disponible',
      poster_url: posterUrl || null,
      director: director || 'Director no disponible',
      anio: year
    };

    console.log(`✅ Datos extraídos exitosamente: ${title} (${year})`);
    return movieData;

  } catch (error) {
    console.error('❌ Error en scraping:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout al conectar con IMDb. Intenta nuevamente.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Película no encontrada.');
    }
    
    throw new Error(`Error al obtener información: ${error.message}`);
  }
}