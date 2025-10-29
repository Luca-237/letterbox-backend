import { Server } from 'socket.io';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Cliente conectado por WebSocket:', socket.id);

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  console.log("Servidor inicializado.');
  return io;
}

export function getIo() {
  if (!io) {
    throw new Error('Socket.io no ha sido inicializado.');
  }
  return io;
}
