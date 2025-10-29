import { io } from 'socket.io-client';


const BACKEND_HOST = window.location.hostname; 
const BACKEND_PORT = 3003; 

const SOCKET_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`; 

export const socket = io(SOCKET_URL, {
});

socket.on('connect', () => {
  console.log('Conectado al servidor WebSocket:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Desconectado del servidor WebSocket:', reason);
});

socket.on('connect_error', (error) => {
  console.error('Error de conexión WebSocket:', error);
});
