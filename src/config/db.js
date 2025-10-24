import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración optimizada del pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'letterbox',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4'
});

// Función para verificar la conexión
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('📦 Conectado a la base de datos MySQL.');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    return false;
  }
};

// Función para cerrar el pool de conexiones
export const closePool = async () => {
  try {
    await pool.end();
    console.log('🔌 Pool de conexiones cerrado.');
  } catch (error) {
    console.error('Error al cerrar el pool:', error.message);
  }
};

export default pool;