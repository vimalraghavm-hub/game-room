import { saveMatchHistory } from '../services/matchHistoryService.js';

export function registerGameHandlers(io, socket, rooms) {
  // ROLL DICE
  socket.on('ROLL_DICE', (data, callback) => {
    const roomCode = socket.data.roomCode;
    const room = rooms.get(roomCode);

    if (!room || !room.gameInstance) {
      return callback?.({ success: false, error: 'No active game session found.' });
    }

    const result = room.gameInstance.rollDice(socket.id);
    if (!result.success) {
      return callback?.({ success: false, error: result.error });
    }

    callback?.({ success: true, ...result });

    // Broadcast dice roll event and state update
    io.to(roomCode).emit('DICE_ROLLED', {
      playerSocketId: socket.id,
      player: result.currentPlayer,
      diceValue: result.roll,
      validMoves: result.validMoves || [],
      snakeOrLadder: result.snakeOrLadder || null,
      autoPass: result.autoPass || false,
      turnForfeited: result.turnForfeited || false,
    });

    io.to(roomCode).emit('GAME_STATE', room.gameInstance.getState());

    // Check if match ended during dice roll (Snake & Ladder or auto pass)
    if (result.status === 'FINISHED') {
      room.status = 'FINISHED';
      io.to(roomCode).emit('GAME_OVER', {
        winner: result.winner,
        rankings: room.gameInstance.rankings,
      });
      saveMatchHistory(room);
    }
  });

  // MOVE TOKEN (Ludo)
  socket.on('MOVE_TOKEN', (data, callback) => {
    const { tokenIndex } = data || {};
    const roomCode = socket.data.roomCode;
    const room = rooms.get(roomCode);

    if (!room || !room.gameInstance || room.gameType !== 'LUDO') {
      return callback?.({ success: false, error: 'Invalid game state or game type.' });
    }

    const result = room.gameInstance.moveToken(socket.id, tokenIndex);
    if (!result.success) {
      return callback?.({ success: false, error: result.error });
    }

    callback?.({ success: true, ...result });

    // Broadcast token move event & updated state
    io.to(roomCode).emit('TOKEN_MOVED', {
      playerSocketId: socket.id,
      player: result.currentPlayer,
      movedTokenIndex: result.movedTokenIndex,
      newStep: result.newStep,
      captured: result.captured || null,
      getsExtraTurn: result.getsExtraTurn || false,
    });

    io.to(roomCode).emit('GAME_STATE', room.gameInstance.getState());

    // Check if match ended
    if (result.status === 'FINISHED') {
      room.status = 'FINISHED';
      io.to(roomCode).emit('GAME_OVER', {
        winner: result.winner,
        rankings: room.gameInstance.rankings,
      });
      saveMatchHistory(room);
    }
  });
}
