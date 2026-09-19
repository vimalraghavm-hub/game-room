export function registerChatHandlers(io, socket, rooms) {
  socket.on('SEND_CHAT', (data, callback) => {
    const { message } = data || {};
    const roomCode = socket.data.roomCode;
    const room = rooms.get(roomCode);

    if (!room) {
      return callback?.({ success: false, error: 'Room not found.' });
    }

    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
      return callback?.({ success: false, error: 'Player not in room.' });
    }

    const chatMsg = room.addChatMessage(player, message || '');
    if (chatMsg) {
      io.to(roomCode).emit('CHAT_MESSAGE', chatMsg);
      callback?.({ success: true, message: chatMsg });
    } else {
      callback?.({ success: false, error: 'Invalid message.' });
    }
  });
}
