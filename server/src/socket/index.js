import { registerRoomHandlers } from './roomHandler.js';
import { registerGameHandlers } from './gameHandler.js';
import { registerChatHandlers } from './chatHandler.js';
import { registerUnoHandlers } from './unoHandler.js';

const rooms = new Map(); // roomCode -> GameRoom instance

export function initSocketIO(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    registerRoomHandlers(io, socket, rooms);
    registerGameHandlers(io, socket, rooms);
    registerChatHandlers(io, socket, rooms);
    registerUnoHandlers(io, socket, rooms);

    socket.on('disconnect', (reason) => {
      console.log(`❌ Client disconnected: ${socket.id} (${reason})`);
      const roomCode = socket.data.roomCode;
      if (!roomCode) return;

      const room = rooms.get(roomCode);
      if (room) {
        const removedPlayer = room.removePlayer(socket.id);
        if (removedPlayer) {
          if (room.status === 'PLAYING') {
            // Set disconnect timer for 30s
            removedPlayer.disconnectTimer = setTimeout(() => {
              console.log(`⏳ Reconnect window expired for ${removedPlayer.username} in room ${roomCode}`);
              if (!removedPlayer.isConnected) {
                // If game still playing and player still disconnected, remove them
                const idx = room.players.findIndex(p => p.userId === removedPlayer.userId);
                if (idx !== -1) {
                  room.players.splice(idx, 1);
                  if (room.players.length === 0) {
                    rooms.delete(roomCode);
                  } else {
                    io.to(roomCode).emit('ROOM_STATE', room.getRoomState());
                  }
                }
              }
            }, 30000);
          }

          io.to(roomCode).emit('ROOM_STATE', room.getRoomState());
        }

        if (room.players.length === 0 && room.status === 'LOBBY') {
          rooms.delete(roomCode);
        }
      }
    });
  });
}
