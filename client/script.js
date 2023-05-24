const socket = new WebSocket("ws://localhost:3000");

socket.addEventListener("open", (event) => {
  console.log("WebSocket connected!");
  //const message = documetn.getElemen()
  socket.send("Hello, server!");
});
//hört auf Nachrichten vom Server


socket.addEventListener("message", (event) => {
  console.log(`Received message: ${event.data}`);
});
//sendet Nachrichten 


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