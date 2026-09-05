const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Permitir conexiones desde cualquier origen (móvil, web, etc.)
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on('connection', (socket) => {
  console.log('⚡ Dispositivo conectado:', socket.id);

  // Unir dispositivos a la misma sala
  socket.on('unirse_sala', (salaId) => {
    socket.join(salaId);
    console.log(`Dispositivo unido a la sala: ${salaId}`);
  });

  // Escuchar la señal del interruptor
  socket.on('cambiar_interruptor', (datos) => {
    // Retransmitir a la web receptora en tiempo real
    io.to(datos.salaId).emit('estado_actualizado', datos.estado);
  });

  socket.on('disconnect', () => {
    console.log('❌ Dispositivo desconectado');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});
