const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const { SerialPort } = require("serialport");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const serialPort = new SerialPort({ path: "COM3", baudRate: 115200 });

let SFP = [0xaa];
let ACK = 0x55;
let ACKSZ = 0x66;

let transmissionInterval;
let stopTransmission = false;
let synchronized = false;
let messageToBeTransmitted;

serialPort.on("open", function () {
  console.log("Serial port opened");

  console.log("Start synch...");
  transmissionInterval = setInterval(() => {
    if (!stopTransmission) {
      serialPort.write(Buffer.from(SFP));
    }
  }, 10);
});

serialPort.on("data", function (data) {
  if (!synchronized) {
    //console.log("Received from serial port:", data.toString());
    //Check if the received byte matches the specific byte to stop transmission
    if (data[0] === ACK) {
      stopTransmission = true;
      clearInterval(transmissionInterval);
      console.log("Synchronized with remote.");
      synchronized = true;
    }
  } else {
    // Receiving while synchronized
    if (data[0] === ACKSZ) {
      console.log("ACKSZ received");
      serialPort.write(messageToBeTransmitted);
    }
  }
});

function splitHighAndLow(str) {
  // Check if the length of the string is less than 65536
  if (str.length >= 65536) {
    console.log("String length exceeds the limit of 65536 characters.");
    return;
  }

  // Convert string length to a 16-bit integer
  let lengthInt = str.length & 0xffff;

  // Compute the low significant byte and the high significant byte
  let lowByte = lengthInt & 0xff; // Extract the low byte
  let highByte = (lengthInt >> 8) & 0xff; // Extract the high byte

  return { highByte: highByte, lowByte: lowByte };
}

wss.on("connection", function connection(ws) {
  console.log("Client connected");

  ws.on("message", function incoming(message) {
    console.log("Received from client:", message);
    if (synchronized) {
      // You can implement additional logic here if needed
      let { highByte, lowByte } = splitHighAndLow(message);
      console.log(highByte, lowByte);
      serialPort.write(Buffer.from([lowByte, highByte]));
      messageToBeTransmitted = message;
    } else {
      console.log("Message received while not syncronized with the remote");
    }
  });

  ws.on("close", function close() {
    console.log("Client disconnected");
  });
});

server.listen(3000, function listening() {
  console.log("Server started on port 3000");
});
