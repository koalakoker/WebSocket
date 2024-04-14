const { SerialPort } = require("serialport");

// Function to enumerate and print available serial ports
function enumerateSerialPorts() {
  SerialPort.list()
    .then((ports) => {
      console.log("Available serial ports:");
      ports.forEach((port) => {
        console.log(
          `"${port.path}": ${port.manufacturer || "Unknown manufacturer"}`
        );
      });
    })
    .catch((err) => {
      console.error("Error enumerating serial ports:", err);
    });
}

// Call the function to enumerate serial ports
enumerateSerialPorts();
