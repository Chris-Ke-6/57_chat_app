//Startet eine Instanz auf dem Localhost 3000
const socket = new WebSocket("ws://localhost:3000");  //Erstellt eine Verbindung mit den Server -> onConnection

//Öffnet die Sendet Daten zum Server 
socket.addEventListener("open", (event) => {
  console.log("WebSocket connected!"); //Erscheint im Clientfenster
});

function messageToServer() {
  let clientChat = document.getElementById("usermsg").value;
  //socket.send(clientChat);
  //An den websocketserver senden, websocket kennt keinen Kanal darum type verwendet
  socket.send(JSON.stringify({ type: 'message', value: clientChat }));
  console.log(clientChat);
}

function userToServer() {
  let userName = document.getElementById("userInputName").value;
  //socket.send(userName);
  socket.send(JSON.stringify({ type: 'user', value: userName }));
  console.log(userName);
}

function changeUserName() {
  let userNameOld = document.getElementById("username_old").value;
  let userNameNew = document.getElementById("username_new").value;
  //socket.send(userName);
  socket.send(JSON.stringify({ type: 'userchange', value: {userNameOld, userNameNew} }));
  console.log(userNameOld,userNameNew);
}

//Empfängt Nachrichten vom Server auf Kanal message
socket.addEventListener("message", (event) => {
  console.log(`Received message: ${event.data}`);
  const parseData = JSON.parse(event.data);
  console.log(parseData.type);

  if (parseData.type === 'userList') {
    receiveUser(parseData.value);
  } else {
    messageChatbox(parseData.value);
  }

  //messageChatbox(event.data);  //im Index.html in die messagebox
  //receiveUser(event.data); //Funktionsaufruf 
});

function messageChatbox(message){
  let messageHistory = document.getElementById("messageHistory");
  let newMessage = document.createElement("p");
  newMessage.textContent = message;
  messageHistory.appendChild(newMessage);
}

function receiveUser(serializedUserObject) {
  const userObject = JSON.parse(serializedUserObject);
  const userElement = document.createElement('p');
  userElement.innerText = userObject.users;
  const users = document.getElementById('userbox')
}

//Schliesst die Websocket Verbindung
socket.addEventListener("close", (event) => {
  console.log("WebSocket closed.");
});

socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event); 
});