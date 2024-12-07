import { randomUUID } from "crypto";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

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

app.use(cors());

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("hit", (playerId, hittedPlayerId) => {
    console.log({ playerId, hittedPlayerId });
    // select the socket id of the player
    const hittedUser = playersList.find(
      (player) => player.id === hittedPlayerId
    );

    const hitterUser = playersList.find((player) => player.name === playerId);

    console.log({ hittedUser, hitterUser });
    // targetId: el ID del socket del cliente al que quieres enviar el mensaje
    io.to(hittedUser.socketId).emit("recived_blow", hitterUser.name);
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
      const id = randomUUID();
      playersList.push({ name, id, socketId: socket.id });
    }

    io.emit("playersList", { playersList });
    io.emit("roomName", { roomName });
  });

  socket.on("startGame", () => {
    console.log("startGame");
    io.emit("startGame", { playersList });
  });

  socket.on("disconnect", () => {
    playersList.splice(
      playersList.findIndex((player) => player.id === socket.id),
      1
    ),
      io.emit("playersList", { playersList, roomName });
  });
});

app.get("/players", (req, res) => {
  console.log({ playersList });
  res.json({ playersList });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
