import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 3001;

const playersList = [];
let roomName = "El lobby de papayón";

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("hit", (playerId, hittedPlayerId) => {
    console.log({ player: playerId, hit_to: hittedPlayerId });
    io.emit("recived_blow", playerId);
  });

  socket.on("playerJoined", (name, lobbyName) => {
    if (playersList.length === 0) {
      roomName = lobbyName;
    }

    console.log("playerJoined", name);
    //add player if not exist in the list
    if (
      playersList.findIndex((player) => player.name === name) === -1 &&
      name.length > 0
    ) {
      playersList.push({ name, id: socket.id });
    }

    io.emit("playersList", { playersList });
    console.log({roomName});
    io.emit("roomName", { roomName });
  });

  socket.on("disconnect", () => {
    playersList.splice(
      playersList.findIndex((player) => player.id === socket.id),
      1
    ),
      io.emit("playersList", { playersList, roomName });
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
