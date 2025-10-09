import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { initSocket } from './src/sockets/socketManager.js';

// Importar rutas
import userRoutes from './src/routes/userRoutes.js';
import movieRoutes from './src/routes/movieRoutes.js';

// --- Configuración inicial ---
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json()); // Permite al servidor entender JSON

// --- Rutas de la API ---
app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);

// --- Servidor HTTP y WebSockets ---
const server = http.createServer(app);
initSocket(server); // Inicializa y adjunta socket.io al servidor

// --- Iniciar el servidor ---
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});