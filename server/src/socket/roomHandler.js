import { GameRoom } from '../games/GameRoom.js';
import { generateRoomCode } from '../utils/codeGenerator.js';

export function registerRoomHandlers(io, socket, rooms) {
  // CREATE ROOM
  socket.on('ROOM_CREATE', (data, callback) => {
    try {
      const { gameType, isPrivate, password, maxPlayers, user } = data || {};
      if (!['SNAKE_LADDER', 'LUDO'].includes(gameType)) {
        return callback?.({ success: false, error: 'Invalid game type.' });
      }

      let roomCode = generateRoomCode();
      while (rooms.has(roomCode)) {
        roomCode = generateRoomCode();
      }

      const room = new GameRoom(roomCode, gameType, {
        hostId: user?.id,
        isPrivate: !!isPrivate,
        password: password || null,
        maxPlayers: Math.min(Math.max(maxPlayers || 4, 2), 4),
      });

      const addResult = room.addPlayer({
        id: socket.id,
        userId: user?.id,
        username: user?.username || 'Host',
        avatar: user?.avatar,
      });

      if (!addResult.success) {
        return callback?.({ success: false, error: addResult.error });
      }

      rooms.set(roomCode, room);
      socket.join(roomCode);
      socket.data.roomCode = roomCode;
      socket.data.userId = user?.id;

      callback?.({
        success: true,
        roomCode,
        roomState: room.getRoomState(),
      });
    } catch (err) {
      console.error('Error in ROOM_CREATE:', err);
      callback?.({ success: false, error: 'Failed to create room.' });
    }
  });

  // JOIN ROOM
  socket.on('ROOM_JOIN', (data, callback) => {
    try {
      const { roomCode, password, user } = data || {};
      const code = roomCode?.toUpperCase()?.trim();
      const room = rooms.get(code);

      if (!room) {
        return callback?.({ success: false, error: 'Room not found.' });
      }

      if (room.isPrivate && room.password && room.password !== password) {
        return callback?.({ success: false, error: 'Incorrect room password.' });
      }

      const addResult = room.addPlayer({
        id: socket.id,
        userId: user?.id,
        username: user?.username,
        avatar: user?.avatar,
      });

      if (!addResult.success) {
        return callback?.({ success: false, error: addResult.error });
      }

      socket.join(code);
      socket.data.roomCode = code;
      socket.data.userId = user?.id;

      callback?.({
        success: true,
        roomCode: code,
        roomState: room.getRoomState(),
      });

      // Broadcast to room
      io.to(code).emit('ROOM_STATE', room.getRoomState());
    } catch (err) {
      console.error('Error in ROOM_JOIN:', err);
      callback?.({ success: false, error: 'Failed to join room.' });
    }
  });

  // TOGGLE READY
  socket.on('PLAYER_READY', (data, callback) => {
    const roomCode = socket.data.roomCode;
    const room = rooms.get(roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found.' });

    const updated = room.toggleReady(socket.id);
    if (updated) {
      io.to(roomCode).emit('ROOM_STATE', room.getRoomState());
      callback?.({ success: true });
    } else {
      callback?.({ success: false, error: 'Cannot toggle ready status.' });
    }
  });

  // START GAME
  socket.on('GAME_START', (data, callback) => {
    const roomCode = socket.data.roomCode;
    const room = rooms.get(roomCode);
    if (!room) return callback?.({ success: false, error: 'Room not found.' });

    const player = room.players.find(p => p.id === socket.id);
    if (!player || !player.isHost) {
      return callback?.({ success: false, error: 'Only the host can start the game.' });
    }

    const startResult = room.startGame();
    if (!startResult.success) {
      return callback?.({ success: false, error: startResult.error });
    }

    callback?.({ success: true });
    io.to(roomCode).emit('GAME_STARTED', room.getRoomState());
    io.to(roomCode).emit('ROOM_STATE', room.getRoomState());
  });

  // LEAVE ROOM
  socket.on('ROOM_LEAVE', (data, callback) => {
    const roomCode = socket.data.roomCode;
    if (!roomCode) return callback?.({ success: true });

    const room = rooms.get(roomCode);
    if (room) {
      room.removePlayer(socket.id);
      socket.leave(roomCode);
      socket.data.roomCode = null;

      if (room.players.length === 0) {
        rooms.delete(roomCode);
      } else {
        io.to(roomCode).emit('ROOM_STATE', room.getRoomState());
      }
    }
    callback?.({ success: true });
  });

  // RECONNECT SESSION
  socket.on('RECONNECT_SESSION', (data, callback) => {
    const { roomCode, userId } = data || {};
    const room = rooms.get(roomCode);
    if (!room) return callback?.({ success: false, error: 'Room no longer exists.' });

    const player = room.players.find(p => p.userId === userId);
    if (!player) return callback?.({ success: false, error: 'Player not in room.' });

    player.id = socket.id;
    player.isConnected = true;
    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.userId = userId;

    callback?.({
      success: true,
      roomState: room.getRoomState(),
    });

    io.to(roomCode).emit('ROOM_STATE', room.getRoomState());
  });
}
