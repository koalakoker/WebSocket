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

const COMSTATE_SYNCH = 0;
const COMSTATE_SIZE = 1;
const COMSTATE_PAYLOAD = 2;
let comState = COMSTATE_SYNCH;
let messageToBeTransmitted;
let expectedAck;

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

function computePayloadAck(str) {
  // Check if the length of the string is less than 65536
  if (str.length >= 65536) {
    console.log("String length exceeds the limit of 65536 characters.");
    return;
  }
  console.log(str);
  let sum = 0;
  // Loop through each character in the string
  for (let i = 0; i < str.length; i++) {
    // Get the character code (byte value) of the current character
    let charCode = str.charCodeAt(i);
    // Add the character code to the sum
    sum += charCode;
  }
  sum = sum & 0xffff;
  // Compute the low significant byte and the high significant byte
  let lowByte = sum & 0xff; // Extract the low byte
  let highByte = (sum >> 8) & 0xff; // Extract the high byte
  return lowByte + highByte;
}

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
  switch (comState) {
    case COMSTATE_SYNCH:
      {
        if (data[0] === ACK) {
          stopTransmission = true;
          clearInterval(transmissionInterval);
          console.log("Synchronized with remote.");
          comState = COMSTATE_SIZE;
        }
      }
      break;
    case COMSTATE_SIZE:
      {
        if (data[0] === ACKSZ) {
          console.log("ACKSZ received");
          serialPort.write(messageToBeTransmitted);
          comState = COMSTATE_PAYLOAD;
        }
      }
      break;
    case COMSTATE_PAYLOAD: {
      if (data[0] === expectedAck) {
        console.log("Payload ACK received");
        comState = COMSTATE_SIZE;
      }
    }
    default:
      break;
  }
});

wss.on("connection", function connection(ws) {
  console.log("Client connected");

  ws.on("message", function incoming(message) {
    console.log("Received from client:", message);
    switch (comState) {
      case COMSTATE_SYNCH:
        {
          console.log("Message received while not syncronized with the remote");
        }
        break;
      case COMSTATE_SIZE:
        {
          let { highByte, lowByte } = splitHighAndLow(message);
          console.log(highByte, lowByte);
          serialPort.write(Buffer.from([lowByte, highByte]));
          messageToBeTransmitted = message;
          expectedAck = computePayloadAck(message.toString("utf8"));
          console.log("Expected ack:" + expectedAck);
        }
        break;
      default:
        break;
    }
  });

  ws.on("close", function close() {
    console.log("Client disconnected");
  });
});

server.listen(3000, function listening() {
  console.log("Server started on port 3000");
});
