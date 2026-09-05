const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const https = require('https');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Tu URL real de MacroDroid:
const MACRODROID_URL = "https://trigger.macrodroid.com/02837119-db38-4cec-b447-f0615bbe4d2e/apagar_pantalla";

io.on('connection', (socket) => {
  socket.on('unirse_sala', (salaId) => {
    socket.join(salaId);
  });

  socket.on('cambiar_interruptor', (data) => {
    io.to(data.salaId).emit('estado_actualizado', data.estado);
  });

  socket.on('solicitar_apagado_telefono', (data) => {
    https.get(MACRODROID_URL, (res) => {
      console.log('Petición enviada a MacroDroid con éxito');
    }).on('error', (err) => {
      console.error('Error al enviar petición a MacroDroid:', err);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
