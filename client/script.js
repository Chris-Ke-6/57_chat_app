const socket = new WebSocket("ws://localhost:3000");  //Erstellt eine Verbindung mit den Server -> onConnection
const msg ={}

function sendToServer(){
  msg = {
    type: "message",
    text: document.getElementById("usermsg").value,
    date: Date.now
  }
}

//Sendet Daten zum Server
socket.addEventListener("open", (event) => {
  console.log("WebSocket connected!");
  //const message = document.getElementById("usermsg").value;
  //socket.send(message);
  socket.send( "Hello, server!");
  //socket.send(JSON.stringify(msg));
});

//Empfängt Nachrichten vom Server
socket.addEventListener("message", (event) => {
  console.log(`Received message: ${event.data}`);
  //im Index.html in die messagebox
});

//Schliesst die Websocket Verbindung
socket.addEventListener("close", (event) => {
  console.log("WebSocket closed.");
});

socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
});


//Eventhandler aus Index.html
//Senden an Backend 
//mit http keine stehende Verbindung, darum Websockets
// 