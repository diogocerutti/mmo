const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const messagesDiv = document.getElementById("messages");
const input = document.getElementById("chatInput");
const sendButton = document.getElementById("sendBtn");

const socket = io(""); // conecta ao mesmo servidor

let players = {};

// Recebe atualização de posições
socket.on("updatePlayers", (data) => {
  players = data;
  drawPlayers();
});

// Recebe mensagens de chat
socket.on("chatMessage", (msg) => {
  const p = document.createElement("p");
  p.textContent = `${msg.id}: ${msg.text}`;
  messagesDiv.appendChild(p);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Envia chat
sendButton.addEventListener("click", () => {
  if (input.value.trim() !== "") {
    socket.emit("chatMessage", input.value);
    input.value = "";
  }
});

// Movimento do stickman
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  socket.emit("moveTo", pos);
});

// Desenha stickmans
function drawPlayers() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let id in players) {
    const p = players[id];
    ctx.fillStyle = "black";
    ctx.fillRect(p.x - 5, p.y - 15, 10, 15); // corpo
    ctx.beginPath();
    ctx.arc(p.x, p.y - 20, 5, 0, Math.PI * 2); // cabeça
    ctx.fill();
  }
}
