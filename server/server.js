"use strict"

const io = require("socket.io")(3000, {
  cors: {
    origin: ["http://localhost:8080", "https://admin.socket.io/"],
  },
});
const { instrument } = require("@socket.io/admin-ui");
const userIo = io.of("/user");
userIo.on("connection", (socket) => {
  console.log("connected to userIo namespace with username " + socket.username);
});
function getUsernameFromToken(token){
    return token;
}
userIo.use((socket, next) => {
  if (socket.handshake.auth.token) {
    socket.username = getUsernameFromToken(socket.handshake.auth.token);
    next();
  }
  else{
      next(new Error('please send token'))
  }
});
io.on("connection", (socket) => {
  console.log(`${socket.id} is now connected`);
  socket.on("sending-message", (payload, room) => {
    if (room === "") {
      socket.broadcast.emit("receiving-message", payload);
    } else {
      socket
      .to(room)
      .emit("receiving-message", `private from ${room}: ${payload}`);
    }
  });
  socket.on("join-room", (room, cb) => {
    socket.join(room);
    cb(`joined ${room}`);
  });
  socket.on('ping',number=>{
      console.log(number);
  })
});
instrument(io, { auth: false });