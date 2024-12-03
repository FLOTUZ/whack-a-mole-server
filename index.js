import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';


const app = express();
const server = createServer(app);
const io = new Server(server,   
    {
     cors: {
       origin: "*",
       methods: ["GET", "POST"],
     }
   });
   
const port = process.env.PORT || 3001;

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('hit', (playerId, hittedPlayerId) => {
        console.log({player: playerId, hit_to: hittedPlayerId});
        io.emit('recived_blow', playerId);
    });
});

server.listen(port, () => {
    console.log(`listening on *:${port}`);
});