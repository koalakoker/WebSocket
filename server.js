const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { SerialPort } = require("serialport");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const serialPort = new SerialPort({ path: "COM1", baudRate: 9600 });

let SFP = [0x01];
let ACK = 0x55;

let transmissionInterval;
let stopTransmission = false;

serialPort.on("open", function () {
  console.log("Serial port opened");

  // Start transmitting a single byte every 10ms
  transmissionInterval = setInterval(() => {
    if (!stopTransmission) {
      serialPort.write(Buffer.from(SFP));
    }
  }, 10);
});

serialPort.on("data", function (data) {
  console.log("Received from serial port:", data.toString());
  // Check if the received byte matches the specific byte to stop transmission
  if (data[0] === ACK) {
    stopTransmission = true;
    clearInterval(transmissionInterval);
    console.log("Transmission stopped");
  }
});

wss.on("connection", function connection(ws) {
  console.log("Client connected");

  ws.on("message", function incoming(message) {
    console.log("Received from client:", message);
    // You can implement additional logic here if needed
  });

  ws.on("close", function close() {
    console.log("Client disconnected");
  });
});

server.listen(3000, function listening() {
  console.log("Server started on port 3000");
});
