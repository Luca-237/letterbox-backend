import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeMovieData(movieName) {
  try {
    // Usamos IMDb como ejemplo. El `encodeURIComponent` formatea el nombre para la URL.
    const searchUrl = `https://www.imdb.com/find?q=${encodeURIComponent(movieName)}`;
    
    // 1. Buscamos la película para obtener su URL principal
    const searchResponse = await axios.get(searchUrl);
    let $ = cheerio.load(searchResponse.data);
    const movieUrlPath = $('.find-title-result a').first().attr('href');
    
    if (!movieUrlPath) {
      throw new Error('Película no encontrada.');
    }

    const movieUrl = `https://www.imdb.com${movieUrlPath}`;

    // 2. Hacemos scraping en la página específica de la película
    const movieResponse = await axios.get(movieUrl);
    $ = cheerio.load(movieResponse.data);

    // Extraemos los datos usando los selectores CSS de IMDb
    const title = $('[data-testid="hero__primary-text"]').text().trim();
    const synopsis = $('[data-testid="plot-l"]').text().trim();
    const posterUrl = $('.ipc-image').first().attr('src');
    const director = $('a[href*="tt_ov_dr"]').first().text().trim();
    const year = $('a[href*="releaseinfo"]').first().text().trim();

    return {
      nombre: title,
      sinopsis,
      poster_url: posterUrl,
      director,
      anio: parseInt(year) || null,
    };
  } catch (error) {
    console.error('Error en el scraping:', error.message);
    throw new Error('No se pudo obtener la información de la película.');
  }
}