// app.js
const socket = new WebSocket("ws://localhost:3000");

socket.onopen = function () {
  console.log("WebSocket connected");
};

socket.onmessage = function (event) {
  const output = document.getElementById("output");
  output.innerHTML += `<p>${event.data}</p>`;
};

function sendMessage() {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value.trim();
  if (message !== "") {
    socket.send(message);
  }
}
