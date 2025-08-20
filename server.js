const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
  console.log("Novo jogador conectado:", socket.id);

  // Cria stickman inicial
  players[socket.id] = {
    x: 200,
    y: 200,
    name: `Player_${socket.id.slice(0, 4)}`,
  };

  // Envia lista de players para o novo conectado
  socket.emit("init", players);

  // Atualiza todos com o novo player
  io.emit("updatePlayers", players);

  // Player clica em um destino
  socket.on("moveTo", (dest) => {
    if (players[socket.id]) {
      players[socket.id].target = dest; // guarda destino no servidor
      io.emit("updatePlayers", players);
    }
  });

  // Recebe posição atual do player
  socket.on("playerMoved", (pos) => {
    if (players[socket.id]) {
      players[socket.id].x = pos.x;
      players[socket.id].y = pos.y;
      io.emit("updatePlayers", players);
    }
  });

  // Chat
  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", { id: socket.id, msg });
  });

  // Player se desconecta
  socket.on("disconnect", () => {
    console.log("Player saiu:", socket.id);
    delete players[socket.id];
    io.emit("updatePlayers", players);
  });
});

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
