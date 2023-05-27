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
  websocketServer.on("connection", onConnection);
  websocketServer.on("error", console.error);
  await subscriber.subscribe("newMessage", onRedisMessage); //Channel newMessage dann Funktion onRedisMessage ausführen
  await publisher.publish("newMessage", "Hello from Redis!");
};

// If a new connection is established, the onConnection function is called
const onConnection = (ws) => {    //funct welche aufgrund vom Client ausgeführt wird
  console.log("New websocket connection");
  ws.on("close", () => onClose(ws));
  ws.send("Hello Client!");
  ws.on("message", (message) => onClientMessage(ws, message)); //Bei neuer Mitteilung wird func onclientMessage ausgeführt
  clients.push(ws);
  // Wie wird der Client identifiziert?
  //TODO!!!!!! Add the client to the clients array
  //
};

// If a new message is received, the onClientMessage function is called
const onClientMessage = (ws, message) => {
  console.log("Message on Websocket from Client received: " + message);
  //ws.send("message",(message) => onRedisMessage(message)); //08:30
  publisher.publish("newMessage", message); //09:30
  //TODO!!!!!! Send the message to the redis channel
};

// If a new message from the redis channel is received, the onRedisMessage function is called
const onRedisMessage = (message) => {
  console.log("Message by redis received: " + message);
  clients.forEach((client) =>{
    client.send(message);
  }); 
  //TODO!!!!!! Send the message to all connected clients
};

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
