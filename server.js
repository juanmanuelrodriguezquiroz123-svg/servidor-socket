const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const https = require('https');

const app = express();
const server = http.createServer(app);

// Permitir conexiones desde cualquier origen (móvil, web, etc.)
const io = new Server(server, {
  cors: { origin: "*" }
});

// Enlace de MacroDroid
const MACRODROID_URL = "https://trigger.macrodroid.com/02837119-db38-4cec-b447-f0615bbe4d2e/apagar_pantalla";

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

    // Si el interruptor pasa a falso/apagado, activamos el Webhook de MacroDroid
    if (datos.estado === false) {
      https.get(MACRODROID_URL, (res) => {
        console.log('🔔 Orden de apagado enviada a MacroDroid');
      }).on('error', (err) => {
        console.error(' Error en MacroDroid:', err.message);
      });
    }
  });

  socket.on('solicitar_apagado_telefono', (data) => {
    https.get(MACRODROID_URL, (res) => {
      console.log('🔔 Orden enviada a MacroDroid');
    }).on('error', (err) => {
      console.error(' Error en MacroDroid:', err.message);
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Dispositivo desconectado');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor listo en el puerto ${PORT}`);
});
