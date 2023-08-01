const path = require("path");
const { createServer } = require("http");
const express = require("express");
const { Server } = require("socket.io");
const Filter = require("bad-words");

const generateMessage = require("./utils/generateMessage");
const generateLocationMessage = require("./utils/generateLocationMessage");
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("./utils/users");

const app = express();
const filter = new Filter();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  // Socket handler
  socket.on("join", ({ username, room }, callback) => {
    // add client to users array
    const { err, user } = addUser({ id: socket.id, username, room });
    if (err) {
      callback(err);
      return;
    }

    // add client to socket room
    socket.join(user.room);

    // emit welcome message to client
    socket.emit("message", generateMessage("Admin", "Welcome!"));

    // broadcast notification to other client
    socket
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );

    // Emit event to client to render all users
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    // Client Acknowledgment
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    // Filter message
    if (filter.isProfane(message)) {
      // Acknowledge client
      callback("Profanity is not allowed!");
      return;
    }

    // Get user info by the socket id
    const user = getUser(socket.id);

    // Send message to all client in the user room
    io.to(user.room).emit("message", generateMessage(user.username, message));

    // Acknowledge client
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    // Destructur location object
    const { latitude, longitude } = location;

    // Get user information
    const user = getUser(socket.id);

    // Send location message to all client in the room
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://www.google.com/maps?q=${latitude},${longitude}`
      )
    );

    // Acknowledge client
    callback();
  });

  // socket disconnect handler
  socket.on("disconnect", () => {
    // Remove user from users array
    const deletedUser = removeUser(socket.id);
    if (!deletedUser) {
      return;
    }

    // Send message to all client in the room
    io.to(deletedUser.room).emit(
      "message",
      generateMessage("Admin", `${deletedUser.username} has left!`)
    );

    // Emit event to client to render all users
    io.to(deletedUser.room).emit("roomData", {
      room: deletedUser.room,
      users: getUsersInRoom(deletedUser.room),
    });
  });
});

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
