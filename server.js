const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// Serve frontend
app.use(express.static(path.join(__dirname, "client")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Socket.IO
let players = {};

io.on("connection", (socket) => {
  console.log("Novo player conectado:", socket.id);

  // Envia estado atual
  socket.emit("updatePlayers", players);

  // Novo player
  players[socket.id] = { x: 100, y: 100 };
  io.emit("updatePlayers", players);

  // Movimento
  socket.on("moveTo", (pos) => {
    players[socket.id] = pos;
    io.emit("updatePlayers", players);
  });

  // Chat
  socket.on("chatMessage", (msg) => {
    io.emit("chatMessage", { id: socket.id, text: msg });
  });

  // Desconexão
  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("updatePlayers", players);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
