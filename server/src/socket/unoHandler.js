import { saveMatchHistory } from '../services/matchHistoryService.js';

export function registerUnoHandlers(io, socket, rooms) {
  // PLAY CARD
  socket.on('UNO_PLAY_CARD', (data, callback) => {
    const { cardId, chosenColor } = data || {};
    const roomCode = socket.data.roomCode;
    const room = rooms.get(roomCode);

    if (!room || !room.gameInstance || room.gameType !== 'UNO') {
      return callback?.({ success: false, error: 'Invalid game state or game type.' });
    }

    const result = room.gameInstance.playCard(socket.id, cardId, chosenColor);
    if (!result.success) {
      return callback?.({ success: false, error: result.error });
    }

    callback?.({ success: true, state: room.gameInstance.getState(socket.id) });

    // Broadcast updated state to room (each player receives their own sanitized state)
    room.players.forEach(p => {
      io.to(p.id).emit('GAME_STATE', room.gameInstance.getState(p.id));
    });

    // Check if match ended
    if (result.state.status === 'FINISHED') {
      room.status = 'FINISHED';
      io.to(roomCode).emit('GAME_OVER', {
        winner: result.state.winner,
      });
      saveMatchHistory(room);
    }
  });

  // DRAW CARD
  socket.on('UNO_DRAW_CARD', (data, callback) => {
    const roomCode = socket.data.roomCode;
    const room = rooms.get(roomCode);

    if (!room || !room.gameInstance || room.gameType !== 'UNO') {
      return callback?.({ success: false, error: 'Invalid game state or game type.' });
    }

    const result = room.gameInstance.drawCard(socket.id);
    if (!result.success) {
      return callback?.({ success: false, error: result.error });
    }

    callback?.({ success: true, state: room.gameInstance.getState(socket.id) });

    // Broadcast sanitized state
    room.players.forEach(p => {
      io.to(p.id).emit('GAME_STATE', room.gameInstance.getState(p.id));
    });
  });

  // CALL UNO
  socket.on('UNO_CALL_UNO', (data, callback) => {
    const roomCode = socket.data.roomCode;
    const room = rooms.get(roomCode);

    if (!room || !room.gameInstance || room.gameType !== 'UNO') {
      return callback?.({ success: false, error: 'Invalid game state or game type.' });
    }

    const result = room.gameInstance.callUno(socket.id);
    if (!result.success) {
      return callback?.({ success: false, error: result.error });
    }

    callback?.({ success: true });

    room.players.forEach(p => {
      io.to(p.id).emit('GAME_STATE', room.gameInstance.getState(p.id));
    });
  });
}
