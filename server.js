const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", function connection(ws) {
  console.log("Client connected");

  ws.on("message", function incoming(message) {
    console.log("Received: %s", message);
    // You can implement serial communication logic here
    // For now, just echo the received message back to the client
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", function close() {
    console.log("Client disconnected");
  });
});

server.listen(3000, function listening() {
  console.log("Server started on port 3000");
});
