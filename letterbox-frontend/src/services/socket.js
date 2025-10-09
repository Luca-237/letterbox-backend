import { io } from 'socket.io-client';

// La URL de tu backend
const SOCKET_URL = 'http://localhost:3001'; 

// Creamos la instancia del socket
export const socket = io(SOCKET_URL);