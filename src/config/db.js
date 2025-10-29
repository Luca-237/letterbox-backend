import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';

dotenv.config();

let db;

export const initDatabase = async () => {
  try {
    db = await open({
      filename: './letterbox.db',
      driver: sqlite3.Database
    });
    
    console.log('Conectado a la base de datos SQLite.');
    
    await createTables();
    
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
    return false;
  }
};

const createTables = async () => {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS pelis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        director TEXT,
        anio INTEGER,
        sinopsis TEXT,
        poster_url TEXT,
        puntuacion_promedio REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.exec(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        pelicula_id INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
        FOREIGN KEY (pelicula_id) REFERENCES pelis (id)
      )
    `);
    
    const movieCount = await db.get('SELECT COUNT(*) as count FROM pelis');
    if (movieCount.count === 0) {
      console.log('Insertando películas de ejemplo...');
      
      await db.exec(`
        INSERT INTO pelis (nombre, director, anio, sinopsis, puntuacion_promedio) VALUES
        ('The Matrix', 'Lana Wachowski', 1999, 'Un programador descubre que la realidad es una simulación.', 4.5),
        ('Inception', 'Christopher Nolan', 2010, 'Un ladrón que roba secretos del subconsciente.', 4.3),
        ('Interstellar', 'Christopher Nolan', 2014, 'Un astronauta viaja a través de un agujero de gusano.', 4.2),
        ('Pulp Fiction', 'Quentin Tarantino', 1994, 'Historias entrelazadas de crimen en Los Ángeles.', 4.4),
        ('The Dark Knight', 'Christopher Nolan', 2008, 'Batman enfrenta al Joker en Gotham City.', 4.6),
        ('Django Unchained', 'Quentin Tarantino', 2012, 'Un esclavo liberado busca venganza en el sur.', 4.1),
        ('Esperando la carroza', 'Alejandro Doria', 1985, 'Una familia espera la muerte de la abuela.', 4.0)
      `);
      
      console.log('Películas de ejemplo insertadas');
    }
    
    console.log('Tablas creadas/verificadas');
  } catch (error) {
    console.error('Error creando tablas:', error);
  }
};

export const testConnection = async () => {
  try {
    if (!db) {
      return await initDatabase();
    }
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error.message);
    return false;
  }
};

export const closeDatabase = async () => {
  try {
    if (db) {
      await db.close();
      console.log('🔌 Base de datos cerrada.');
    }
  } catch (error) {
    console.error('Error al cerrar la base de datos:', error.message);
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Base de datos no inicializada. Llama a initDatabase() primero.');
  }
  return db;
};

export default getDatabase;
