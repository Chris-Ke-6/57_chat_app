const WebSocket = require("ws");
const redis = require("redis");

let publisher;

const clients = [];

// Intiiate the websocket server
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

  //Redis instruieren dass Mitteilungen aus dem Kanal "newMessage", "users" übernommen werden und dann Funktion onRedisMessage/onRedisUsers ausführen.
  await subscriber.subscribe("newMessage", onRedisMessage);
  //await subscriber.subscribe("users", onRedisUsers);

  //Redis instruieren dass eine Mittteilung im Kanal "newMessage" publiziert wird.
  await publisher.publish("newMessage", "Hello from Redis!");
};

// If a new connection is established, the onConnection function is called
const onConnection = (ws) => {    //funct welche aufgrund vom Client ausgeführt wird
  console.log("New websocket connection");
  ws.on("close", () => onClose(ws));
  ws.send("Hello Client!");
  ws.on('message', (message)=> { //Kanal ist message, Textinhalt ist (message)
    const parseMessage = JSON.parse(message);
    const type = parseMessage.type;
    const value = parseMessage.value;

    if (type === 'message'){
      console.log(value);
      onClientMessage(ws,value);
    } else if (type === 'user') {
      console.log(value);
      onClientUsername(ws,value);
    } else if (type === 'userchange'){
      console.log(value);
      onClientUserchange(ws,value);
    }
  })
};

// If a new message is received, the onClientMessage function is called
const onClientMessage = (ws, message) => {
  console.log("Message on Websocket from Client received: " + message);
  //ws.send("message",(message) => onRedisMessage(message));
  publisher.publish("newMessage", message); //message publizieren in den Redis Kanal "newMessage"
};

// If a new userName is received, the onClientUsername function is called
const onClientUsername = (ws, userName) => {
  console.log("Username on Websocket from Client received: " + userName);
  clients.push({ws,userName});
  console.log(clients);
  //publisher.publish("users",clients); //Clients publizieren in den Redis Kanal "users"
};

// If a Change of Username is received, the onClientUserchange is called
const onClientUserchange = (ws, userNames) => {
  console.log("UserChange on Websocket from Client received");
  console.log(JSON.stringify(userNames.userNameOld + userNames.userNameNew));
  //
};

// If a new message from the redis channel is received, the onRedisMessage function is called
const onRedisMessage = (message) => {
  console.log("Message by redis received: " + message);
  clients.forEach((client) =>{
    client.ws.send(message);
  }); 
  //TODO!!!!!! Send the message to all connected clients
};

// // If a new user from the redis channel is received, the onRedisMessage function is called
// const onRedisUsers = (clients) => {
//   console.log("Message by redis received: " + clients);
//   clients.forEach((client) =>{
//     client.ws.send(clients);
//   }); 
// }

// If a connection is closed, the onClose function is called
const onClose = (ws) => {
  console.log("Websocket connection closed");
  const index = clients.indexOf(ws);
  if (index !== -1) {
    clients.splice(index, 1)
  };
}  
//TODO!!!!!! Remove the client from the clients array

module.exports = { initializeWebsocketServer };
