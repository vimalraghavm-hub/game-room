import { SnakeLadderGame } from './SnakeLadderGame.js';
import { LudoGame } from './LudoGame.js';
import UnoGame from './UnoGame.js';

export class GameRoom {
  constructor(roomCode, gameType, options = {}) {
    this.roomCode = roomCode;
    this.gameType = gameType; // 'SNAKE_LADDER' or 'LUDO'
    this.hostId = options.hostId || null;
    this.isPrivate = options.isPrivate || false;
    this.password = options.password || null;
    this.maxPlayers = options.maxPlayers || 4;

    this.players = []; // [{ id (socketId), userId, username, avatar, isHost, isReady, isConnected, disconnectTimer }]
    this.status = 'LOBBY'; // 'LOBBY', 'PLAYING', 'FINISHED'
    this.chatMessages = [];
    this.gameInstance = null;
    this.createdAt = new Date();
  }

  addPlayer(playerData) {
    if (this.players.length >= this.maxPlayers) {
      return { success: false, error: 'Room is full.' };
    }

    if (this.status !== 'LOBBY') {
      // Check if this is a reconnecting player
      const existingPlayer = this.players.find(p => p.userId && p.userId === playerData.userId);
      if (existingPlayer) {
        existingPlayer.id = playerData.id; // Update socket ID
        existingPlayer.isConnected = true;
        if (existingPlayer.disconnectTimer) {
          clearTimeout(existingPlayer.disconnectTimer);
          existingPlayer.disconnectTimer = null;
        }
        return { success: true, reconnected: true, player: existingPlayer };
      }
      return { success: false, error: 'Game has already started.' };
    }

    const isHost = this.players.length === 0 || playerData.userId === this.hostId;
    const player = {
      id: playerData.id, // Socket ID
      userId: playerData.userId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      username: playerData.username || `Player ${this.players.length + 1}`,
      avatar: playerData.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${playerData.username || Date.now()}`,
      isHost: isHost,
      isReady: isHost, // Host is ready by default
      isConnected: true,
      disconnectTimer: null,
    };

    if (isHost) {
      this.hostId = player.userId;
    }

    this.players.push(player);
    return { success: true, reconnected: false, player };
  }

  removePlayer(socketId) {
    const playerIndex = this.players.findIndex(p => p.id === socketId);
    if (playerIndex === -1) return null;

    const removedPlayer = this.players[playerIndex];

    if (this.status === 'LOBBY') {
      this.players.splice(playerIndex, 1);
      // Reassign host if host left
      if (removedPlayer.isHost && this.players.length > 0) {
        this.players[0].isHost = true;
        this.players[0].isReady = true;
        this.hostId = this.players[0].userId;
      }
    } else {
      // Game in progress: Mark disconnected, keep in room for 30 seconds reconnect window
      removedPlayer.isConnected = false;
    }

    return removedPlayer;
  }

  toggleReady(socketId) {
    const player = this.players.find(p => p.id === socketId);
    if (player && this.status === 'LOBBY') {
      player.isReady = !player.isReady;
      return true;
    }
    return false;
  }

  canStartGame() {
    if (this.players.length < 2) return { canStart: false, reason: 'At least 2 players are required to start.' };
    const allReady = this.players.every(p => p.isReady);
    if (!allReady) return { canStart: false, reason: 'All players must be ready to start.' };
    return { canStart: true };
  }

  startGame() {
    const { canStart, reason } = this.canStartGame();
    if (!canStart) return { success: false, error: reason };

    this.status = 'PLAYING';

    if (this.gameType === 'SNAKE_LADDER') {
      this.gameInstance = new SnakeLadderGame();
      this.gameInstance.init(this.players);
    } else if (this.gameType === 'LUDO') {
      this.gameInstance = new LudoGame();
      this.gameInstance.init(this.players);
    } else if (this.gameType === 'UNO') {
      this.gameInstance = new UnoGame(this.players.map(p => ({ id: p.id, name: p.username, avatar: p.avatar })));
      this.gameInstance.start();
    }
    return { success: true, gameType: this.gameType };
  }

  addChatMessage(sender, text) {
    const sanitizedText = text.trim().substring(0, 200); // 200 chars limit
    if (!sanitizedText) return null;

    const msg = {
      id: Date.now() + Math.random(),
      senderName: sender.username,
      senderColor: sender.color || '#8B5CF6',
      text: sanitizedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.chatMessages.push(msg);
    if (this.chatMessages.length > 100) this.chatMessages.shift();
    return msg;
  }

  getRoomState() {
    return {
      roomCode: this.roomCode,
      gameType: this.gameType,
      hostId: this.hostId,
      isPrivate: this.isPrivate,
      maxPlayers: this.maxPlayers,
      status: this.status,
      players: this.players.map(p => ({
        id: p.id,
        userId: p.userId,
        username: p.username,
        avatar: p.avatar,
        isHost: p.isHost,
        isReady: p.isReady,
        isConnected: p.isConnected,
      })),
      chatMessages: this.chatMessages,
      gameState: this.gameInstance ? this.gameInstance.getState() : null,
    };
  }
}
