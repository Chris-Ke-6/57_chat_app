//Startet eine Instanz auf dem Localhost 9000
const socket = new WebSocket("ws://localhost:9000");  //Erstellt eine Verbindung mit den Server -> onConnection

//Öffnet die Sendet Daten zum Server 
socket.addEventListener("open", (event) => {
  console.log("WebSocket connected!"); //Erscheint im Clientfenster
});

function messageToServer() {
  let clientText = document.getElementById("usermsg").value;
  let clientName = document.getElementById("username_old").value;
  let clientChat = clientName + " : " + clientText; 

  //An den websocketserver senden, websocket kennt keinen Kanal darum type verwendet
  socket.send(JSON.stringify({ type: 'message', value: clientChat }));
  console.log(clientChat);
  document.getElementById("usermsg").value ="";
}

function userToServer() {
  let userName = document.getElementById("userInputName").value;
  if (userName == ""|| userName.length < 2 ) {
    alert('Bitte Benutzername mit mind. 2 Buchstaben eingeben');
    //Abbruch damit Code nicht weiter geht
  } else {
    document.getElementById("username_old").value = userName;
    socket.send(JSON.stringify({ type: 'user', value: userName }));
    console.log(userName);
    document.getElementById("userInputName").value = "";
  }
}

function changeUserName() {
  let userNameOld = document.getElementById("username_old").value;
  let userNameNew = document.getElementById("username_new").value;
  socket.send(JSON.stringify({ type: 'userchange', value: {userNameOld, userNameNew} }));
  console.log(userNameOld,userNameNew);
  document.getElementById("username_old").value = userNameNew;
  document.getElementById("username_new").value = "";
}

//Empfängt Nachrichten vom Server
socket.addEventListener("message", (event) => {
  console.log(`Received message: ${event.data}`);
  console.log(event.data);
  const parseData = JSON.parse(event.data);
  console.log(parseData.type);
  console.log(parseData.value);

  if (parseData.type === 'userList') {
    receiveUser(parseData.value);
  } else if (parseData.type == 'fault') {
    document.getElementById("userInputName").value = "Name vergeben, bitte neu wählen"
  } else {
    messageChatbox(parseData.value);
  } 
});

function messageChatbox(message){
  let messageHistory = document.getElementById("messageHistory");
  let newMessage = document.createElement("p");
  newMessage.textContent = message;
  messageHistory.appendChild(newMessage);
}

function receiveUser(userList) {
  const userListArray = JSON.parse(userList);
  const userbox = document.getElementById('userbox')
  userbox.innerHTML ='';

  userListArray.forEach(user => {
    const userElement = document.createElement('p'); 
    userElement.textContent = user.userName;
    userbox.appendChild(userElement) 
  });  
}

//Schliesst die Websocket Verbindung
socket.addEventListener("close", (event) => {
  console.log("WebSocket closed.");
});

socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event); 
});