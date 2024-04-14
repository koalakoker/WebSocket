// app.js
const socket = new WebSocket("ws://localhost:3000");
const messageInput = document.getElementById("messageInput");
messageInput.value = "Hello World";
let optionButtons = document.getElementsByName("state");
optionButtons.forEach((button) => {
  button.addEventListener("change", function () {
    if (button.checked) {
      console.log("Selected value changed to:", button.value);
      if (button.value === "stop") {
        clearTimeout(transmissionInterval);
      }
      if (button.value === "run") {
        transmissionInterval = setInterval(() => {
          sendMessage();
        }, 500);
      }
    }
  });
});

socket.onopen = function () {
  console.log("WebSocket connected");
  transmissionInterval = setInterval(() => {
    sendMessage();
  }, 500);
};

socket.onmessage = function (event) {
  const output = document.getElementById("output");
  output.innerHTML += `<p>${event.data}</p>`;
};

function sendMessage() {
  const message = messageInput.value.trim();
  if (message !== "") {
    socket.send(message);
  }
}
