import { io } from 'socket.io-client';

// Dynamically determine the backend host based on how the frontend is accessed
const BACKEND_HOST = window.location.hostname; // Gets the hostname/IP from the browser's address bar
const BACKEND_PORT = 3003; // Keep your backend port consistent

// La URL de tu backend usando el host dinámico
const SOCKET_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`; // Use the dynamic host

// Creamos la instancia del socket
export const socket = io(SOCKET_URL, {
  // Opciones adicionales si son necesarias
});

// Opcional: Manejar eventos de conexión/desconexión
socket.on('connect', () => {
  console.log('🔌 Conectado al servidor WebSocket:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Desconectado del servidor WebSocket:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Error de conexión WebSocket:', error);
});