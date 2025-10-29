import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './src/sockets/socketManager.js';
import { initDatabase } from './src/config/db.js';

import userRoutes from './src/routes/userRoutes.js';
import movieRoutes from './src/routes/movieRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

const server = http.createServer(app);
initSocket(server); 

const startServer = async () => {
  try {
   
    const dbConnected = await initDatabase();
    if (!dbConnected) {
      console.error('No se pudo conectar a la base de datos. Verifica la configuración.');
      process.exit(1);
    }

    server.listen(PORT, '0.0.0.0', () => { 
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Frontend URL permitido (CORS): ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
