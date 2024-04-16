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

function sendMessage() {
  socket.send(createPacket());
}

function createPacket() {
  let ARR = 4000;
  let CountinMode = 1;
  let CCR1 = 1000;
  let mode1 = 0;
  let CCR2 = 2000;
  let mode2 = 0;
  let CCR3 = 3000;
  let mode3 = 0;
  let arrayBuffer = new ArrayBuffer(12);
  let dataView = new DataView(arrayBuffer);
  dataView.setUint16(0, ARR, true);
  dataView.setUint8(2, CountinMode);
  dataView.setUint16(3, CCR1, true);
  dataView.setUint8(5, mode1);
  dataView.setUint16(6, CCR2, true);
  dataView.setUint8(8, mode2);
  dataView.setUint16(9, CCR3, true);
  dataView.setUint8(11, mode3);
  return arrayBuffer;
}
