const express = require('express')
const app = express()
const port = process.env.PORT || 4002;
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
      origin: [process.env.CLIENT_URL],
      methods: ["GET", "POST"],
      transports : ['websocket'],
      credentials: true
    }
  });
  
app.use('/', (req, res) => res.send('Hello World!!!'));

let rooms = [];
let roomDetails = [];
const colors = ['red', 'green', 'blue', 'pink', 'purple', 'slateblue', 'orange', 'grey', 'brown', 'teal'];
io.on('connection', (socket) => { 
    //console.log(`Server: Socket Open ${socket.id}`);

    socket.on("join-room", (startType, room, player, numOfRows, numOfCols) => {
      if((startType === 'NEW_GAME' && rooms.findIndex(item=> item.roomName === room) === -1) || 
      (startType === 'JOIN_GAME' && rooms.findIndex(item=> item.roomName === room) !== -1))
      {
        const foundRoomDetail = roomDetails.filter(roomDetail => roomDetail.roomName===room)[0];
        if(foundRoomDetail !== undefined && foundRoomDetail.gameStart === true){
          io.to(socket.id).emit('alert', 'This Game has already been started. You cannot join an already started Game.');
          return;
        }
        else{
          socket.join(room);
          //console.log('color', rooms, rooms.filter(item=>item.roomName === room), rooms.filter(item=>item.roomName === room).length);
          const player_color = rooms.length===0? 0:rooms.filter(item=>item.roomName === room).length;
          rooms.push({roomName:room, socketID: socket.id, playerName: player, playerColor: colors[player_color]});
        }
      }
      else{
        io.to(socket.id).emit('alert', (startType === 'NEW_GAME'? 'Sorry, there is already a Game being played with this name. Please try a different name.' : 'Sorry, there is no game being played with the name provided to join. Please re-check the game name.'));
        return;
      }

      if(roomDetails.findIndex(detail => detail.roomName === room) === -1){
        //console.log('Room Details', 'New Room Detail');
        roomDetails.push({roomName: room, numberOfRows: numOfRows, numberOfColumns: numOfCols, gameStart: false})
      }
      else{
        //console.log('Room Details', roomDetails.filter(item=>item.roomName === room)[0]);
        io.to(socket.id).emit('board-setup', roomDetails.filter(item=>item.roomName === room)[0]);
      }

      io.in(room).emit('room-players', rooms.filter(item=>item.roomName === room));

      io.to(socket.id).emit('player-joined', rooms.filter(item=>item.socketID === socket.id)[0]);

      socket.to(room).emit('player-joined-notification', player);

      //console.log(`Room Joined: ${room}`, rooms);
    })

    socket.on("send-msg", (sharingRoom, sharingSquares, sharingCurrentPlayer) => {
        //console.log('Passing on the socket');
        roomDetails.filter(roomDetail => roomDetail.roomName===sharingRoom)[0].gameStart = true;
        io.to(sharingRoom).emit('receive-msg', sharingSquares, sharingCurrentPlayer);
    })

    socket.on("disconnect", () => {
      const disconnectingSocketBelongsToRoom = (rooms.filter(item => item.socketID === socket.id))[0];
      //console.log('disconnectingSocketBelongsToRoom', disconnectingSocketBelongsToRoom)
      rooms = rooms.filter(item => item.socketID !== socket.id);
      if(disconnectingSocketBelongsToRoom){
        const playersInDisconnectingRoom = rooms.filter(item=>item.roomName === disconnectingSocketBelongsToRoom.roomName);
        if(playersInDisconnectingRoom.length===0){
          roomDetails = roomDetails.filter(item => item.roomName !== disconnectingSocketBelongsToRoom.roomName);
        }
        socket.to(disconnectingSocketBelongsToRoom.roomName).emit('player-disconnected', playersInDisconnectingRoom, disconnectingSocketBelongsToRoom);
        //console.log("Client disconnected", socket.id, playersInDisconnectingRoom, roomDetails);
      }
    });
 });


 server.listen(port, () => console.log(`Listening on port ${port}`));