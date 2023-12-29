// socketServer.js

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

function startSocketServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(cors());

  const io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.static('public'));

  io.on('connection', (socket) => {
    console.log('Usuario conectado');

    // Escucha el evento 'mensaje' del cliente
    socket.on('mensaje', (mensaje) => {
      console.log('Mensaje recibido:', mensaje);

      // Emite el mensaje a todos los clientes conectados
      io.emit('mensaje', [mensaje,2]);
    });

    // Manejar desconexiones
    socket.on('disconnect', () => {
      console.log('Usuario desconectado');
    });
  });

  // Agrega un método para enviar mensajes desde el exterior
  function enviarMensajeDesdeExterior(mensaje,cod) {
    io.emit('mensaje', [mensaje,cod]);
  }

  const PORT = process.env.PORT || 3002;
  server.listen(PORT, () => {
    console.log(`Servidor socket en  http://localhost:${PORT}`);
  });

  // Retorna la función que permite enviar mensajes desde el exterior
  return enviarMensajeDesdeExterior;
}

// Exporta la función para que pueda ser usada desde otro archivo
module.exports = startSocketServer;
