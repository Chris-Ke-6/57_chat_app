const WebSocket = require("ws");
const redis = require("redis");

let publisher;

const clients = [];

// Inizialisiert den websocket server
const initializeWebsocketServer = async (server) => {
  const client = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || "6379",
    },
  });
  // This is the subscriber part
  const subscriber = client.duplicate();
  await subscriber.connect();
  // This is the publisher part
  publisher = client.duplicate();
  await publisher.connect();

  const websocketServer = new WebSocket.Server({ server });
  websocketServer.on("connection", onConnection);  //Falls eine neuen Verbindung vorhanden dann Funktion onConnection ausführen.
  websocketServer.on("error", console.error);

  //Redis instruieren dass Mitteilungen aus dem Kanal übernommen werden und dann Funktion ausgeführt wird
  await subscriber.subscribe("newMessage", onRedisMessage);
  await subscriber.subscribe("users", onRedisUsers);

  //Redis instruieren dass eine Mittteilung im Kanal "newMessage" publiziert wird.
  await publisher.publish("newMessage", "Hello from Redis!");
};

// If a new connection is established, the onConnection function is called
const onConnection = (ws) => {              //funct welche aufgrund vom Client ausgeführt wird
  console.log("New websocket connection");
  ws.on("close", () => onClose(ws));
  ws.send(JSON.stringify({ type: 'message', value: "Hallo Nutzer, immmer zuerst anmelden, dann chaten!"}));
  ws.on('message', (message)=> {              //Kanal ist message, Textinhalt ist (message)
    const parseMessage = JSON.parse(message); //Deserialisieren und 
    const type = parseMessage.type;           // Variable type zuweisen
    const value = parseMessage.value;         // Variable value zweisen 

    if (type === 'message'){                  //Wenn type gleich message, dann
      console.log(value);
      onClientMessage(ws,value);
    } else if (type === 'user') {               //Wenn type gleich user
      console.log(value);
      onClientUsername(ws,value);
    } else if (type === 'userchange'){           //Wenn type gleich userchange
      console.log(value);
      onClientUserchange(ws,value);
    }
  })
};

// If a new message is received, the onClientMessage function is called
const onClientMessage = (ws, message) => {
  console.log("Message on Websocket from Client received: ", message);
  publisher.publish("newMessage", message);   //Publizieren in den Redis Kanal "newMessage"
};

// If a new userName is received, the onClientUsername function is called
const onClientUsername = (ws, userName) => {
  console.log("Username on Websocket from Client received: ", userName);

  //Prüfung ob Username bereits vorhanden
  const index = clients.findIndex(client => client.userName === userName);
  console.log(index);
  if (index !== -1){
    //Fehlemeldung Name bereits vorhanden
    ws.send(JSON.stringify({ type: 'fault', value: "Benutzername ungültig"}));
  } else {
    clients.push({ ws, userName});
    const userList = clients.map((client) => ({ userName: client.userName }));
    publisher.publish("users", JSON.stringify(userList)); //Publizieren in den Redis Kanal "users"
  }
};

// If a Change of Username is received, the onClientUserchange is called
const onClientUserchange = (ws, userNames) => {
  console.log("UserChange on Websocket from Client received");
  const index = clients.findIndex(client => client.userName === userNames.userNameOld);
  console.log(index);
  if (index !== -1){
    clients[index].userName = userNames.userNameNew;
  };
  const userList = clients.map((client) => ({ userName: client.userName }));
  publisher.publish("users", JSON.stringify(userList));  //Publizieren in den Redis Kanal "users"
};

// If a new message from the redis channel is received, the onRedisMessage function is called
const onRedisMessage = (message) => {
  console.log("Message by redis received: " + message);
  const data ={
    type: 'message',
    value: message
  };
  const serialData = JSON.stringify(data);
  clients.forEach((client) =>{
    client.ws.send(serialData);
  });
};

// If a new user from the redis channel is received, the onRedisUser function is called
const onRedisUsers = (userList) => {
  console.log("Users by redis received: " + userList);
  const data = {
    type: 'userList',
    value: userList
  };
  const serialData = JSON.stringify(data);
  clients.forEach((client)=>{
    client.ws.send(serialData);
    console.log(serialData);
  });
};

// If a connection is closed, the onClose function is called
const onClose = (ws) => {
  console.log("Websocket connection closed");
  const index = clients.findIndex(client => client.ws === ws);
  if (index !== -1) {
    console.log(index);
    clients.splice(index, 1)
  };
  const userList = clients.map((client) => ({ userName: client.userName }));
  publisher.publish("users", JSON.stringify(userList));  //Publizieren in den Redis Kanal "users"
}

module.exports = { initializeWebsocketServer };
