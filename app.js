// app.js
const socket = new WebSocket("ws://localhost:3000");
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

socket.onmessage = function (event) {};

function sendMessage() {
  let ARR = 4000;
  let CountinMode = 1;
  let CCR1 = 1000;
  let mode1 = 0;
  let CCR2 = 2000;
  let mode2 = 0;
  let CCR3 = 3000;
  let mode3 = 0;

  let arrayBuffer = new ArrayBuffer(6); // 2 bytes for each 16-bit value and 1 byte for each 8-bit value
  let dataView = new DataView(arrayBuffer);
  // Write the 16-bit values to the buffer
  //dataView.setUint16(0, ARR, true); // Write ARR as a 16-bit little-endian integer at byte offset 0
  //dataView.setUint16(2, CCR1, true); // Write CCR as a 16-bit little-endian integer at byte offset 2

  // Write the 8-bit values to the buffer
  //dataView.setUint8(4, mode1); // Write mode1 as an 8-bit integer at byte offset 4
  //dataView.setUint8(5, mode2); // Write mode2 as an 8-bit integer at byte offset 5

  // Convert the ArrayBuffer to a string
  let bufferString = String.fromCharCode.apply(
    null,
    new Uint8Array(arrayBuffer)
  );

  socket.send(bufferString);
}
