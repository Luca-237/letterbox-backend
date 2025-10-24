import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './src/sockets/socketManager.js';
import { testConnection } from './src/config/db.js';

// Importar rutas
import userRoutes from './src/routes/userRoutes.js';
import movieRoutes from './src/routes/movieRoutes.js';

// --- Configuración inicial ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
})); // CORS configurado para producción
app.use(express.json({ limit: '10mb' })); // Límite de tamaño para JSON
app.use(express.urlencoded({ extended: true })); // Para formularios

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
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifica la configuración.');
      process.exit(1);
    }

    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();