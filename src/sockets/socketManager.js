import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // En producción, limita esto a tu dominio del frontend
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado por WebSocket:', socket.id);

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  console.log('🔌 Servidor de WebSockets inicializado.');
  return io;
}

export function getIo() {
  if (!io) {
    throw new Error('Socket.io no ha sido inicializado.');
  }
  return io;
}