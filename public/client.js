const socket = io("melhormmo.up.railway.app");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let players = {};

// Inicializa
socket.on("init", (serverPlayers) => {
  players = serverPlayers;
});

// Atualiza jogadores
socket.on("updatePlayers", (serverPlayers) => {
  players = serverPlayers;
});

// Chat
socket.on("chatMessage", ({ id, msg }) => {
  const div = document.getElementById("messages");
  const p = document.createElement("p");
  p.innerText = `${players[id]?.name || id}: ${msg}`;
  div.appendChild(p);
  div.scrollTop = div.scrollHeight;
});

document.getElementById("msgInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    socket.emit("chatMessage", e.target.value);
    e.target.value = "";
  }
});

// Clicar no canvas para mover
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  socket.emit("moveTo", { x, y });
});

// Loop de desenho
function draw() {
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let id in players) {
    let p = players[id];

    // Se tiver destino, mover suavemente
    if (p.target) {
      let dx = p.target.x - p.x;
      let dy = p.target.y - p.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        let speed = 2; // velocidade
        p.x += (dx / dist) * speed;
        p.y += (dy / dist) * speed;

        // Apenas atualize o servidor se for o player local
        if (socket.id === id && p.target) {
          socket.emit("playerMoved", { x: p.x, y: p.y });
        }
      } else {
        p.x = p.target.x;
        p.y = p.target.y;
        delete p.target; // chegou ao destino
      }
    }

    drawStickman(p.x, p.y, p.name);
  }

  requestAnimationFrame(draw);
}

function drawStickman(x, y, name) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;

  // Cabeça
  ctx.beginPath();
  ctx.arc(x, y - 20, 10, 0, Math.PI * 2);
  ctx.stroke();

  // Corpo
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x, y + 20);
  ctx.stroke();

  // Braços
  ctx.beginPath();
  ctx.moveTo(x - 15, y);
  ctx.lineTo(x + 15, y);
  ctx.stroke();

  // Pernas
  ctx.beginPath();
  ctx.moveTo(x, y + 20);
  ctx.lineTo(x - 10, y + 40);
  ctx.moveTo(x, y + 20);
  ctx.lineTo(x + 10, y + 40);
  ctx.stroke();

  // Nome
  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(name, x - 20, y - 30);
}

draw();
