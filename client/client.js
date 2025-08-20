// Substitua pela URL do seu Render online
const SERVER_URL = "https://mmo-yfsy.onrender.com/";
const socket = io(SERVER_URL);

// Movimento
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  socket.emit("moveTo", pos);
});

// Receber posições
socket.on("updatePlayers", (data) => {
  players = data;
});

// Chat
sendButton.addEventListener("click", () => {
  socket.emit("chatMessage", input.value);
});
socket.on("chatMessage", (msg) => {
  displayMessage(msg);
});
