//Startet eine Instanz auf dem Localhost 3000
const socket = new WebSocket("ws://localhost:3000");  //Erstellt eine Verbindung mit den Server -> onConnection

//Sendet Daten zum Server 
socket.addEventListener("open", (event) => {
  console.log("WebSocket connected!"); //Erscheint im Clientfenster
});

function messageToServer() {
  let clientChat = document.getElementById("usermsg").value;
  //socket.send(clientChat);
  socket.send(JSON.stringify({ type: 'message', value: clientChat }));
  console.log(clientChat);
}
function userToServer() {
  let userName = document.getElementById("userInputName").value;
  //socket.send(userName);
  socket.send(JSON.stringify({ type: 'user', value: userName }));
  console.log(userName);
}

//Empfängt Nachrichten vom Server
socket.addEventListener("message", (event) => {
  console.log(`Received message: ${event.data}`);
  messageChatbox(event.data);  //im Index.html in die messagebox
});

function messageChatbox(message){
  let messageHistory = document.getElementById("messageHistory");
  let newMessage = document.createElement("p");
  newMessage.textContent = message;
  messageHistory.appendChild(newMessage);
}

//Schliesst die Websocket Verbindung
socket.addEventListener("close", (event) => {
  console.log("WebSocket closed.");
});

socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event); 
});