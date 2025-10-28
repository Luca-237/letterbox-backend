import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './src/sockets/socketManager.js';
import { initDatabase } from './src/config/db.js';

// Importar rutas
import userRoutes from './src/routes/userRoutes.js';
import movieRoutes from './src/routes/movieRoutes.js';

// --- Configuración inicial ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3003;

// --- Middlewares ---
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Esto se leerá desde .env
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// --- Middleware de logging ---
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// --- Rutas de la API ---
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);

// --- Ruta de salud del servidor ---
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// --- Middleware de manejo de errores ---
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// --- Servidor HTTP y WebSockets ---
const server = http.createServer(app);
initSocket(server); // Inicializa y adjunta socket.io al servidor

// --- Iniciar el servidor ---
const startServer = async () => {
  try {
    // Inicializar la base de datos
    const dbConnected = await initDatabase();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifica la configuración.');
      process.exit(1);
    }

    // Escuchar en todas las interfaces de red ('0.0.0.0')
    server.listen(PORT, '0.0.0.0', () => { // <--- CAMBIO AQUÍ
      console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL permitido (CORS): ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();