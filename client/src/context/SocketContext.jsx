import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const envUrl = import.meta.env.VITE_SERVER_URL;
const SERVER_URL = (envUrl && envUrl !== 'http://localhost:3001')
  ? envUrl
  : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:10000');

export const SocketProvider = ({ children }) => {
  const { profile } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastDiceResult, setLastDiceResult] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);
  const roomStateRef = useRef(roomState);

  useEffect(() => {
    roomStateRef.current = roomState;
  }, [roomState]);

  useEffect(() => {
    console.log('🔌 CLIENT: Connecting Socket.IO to:', SERVER_URL);
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ CLIENT SOCKET CONNECTED:', newSocket.id);
      setConnected(true);
      setIsReconnecting(false);

      // Reconnect session if player was in an active room
      const savedSession = sessionStorage.getItem('gameroom_session');
      if (savedSession) {
        try {
          const { roomCode, userId } = JSON.parse(savedSession);
          if (roomCode && userId) {
            newSocket.emit('RECONNECT_SESSION', { roomCode, userId }, (res) => {
              if (res?.success && res.roomState) {
                setRoomState(res.roomState);
                if (res.roomState.gameState) setGameState(res.roomState.gameState);
              } else {
                sessionStorage.removeItem('gameroom_session');
              }
            });
          }
        } catch (e) {}
      }
    });

    newSocket.on('connect_error', (err) => {
      console.warn('⚠️ CLIENT: Socket connect error:', err.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('❌ CLIENT SOCKET DISCONNECTED:', reason);
      setConnected(false);
      setIsReconnecting(true);
    });

    newSocket.on('ROOM_STATE', (state) => {
      setRoomState(state);
      if (state?.gameState) setGameState(state.gameState);
    });

    newSocket.on('GAME_STARTED', (state) => {
      setRoomState(state);
      if (state?.gameState) setGameState(state.gameState);
    });

    newSocket.on('GAME_STATE', (state) => {
      setGameState(state);
    });

    newSocket.on('DICE_ROLLED', (data) => {
      setLastDiceResult(data);
      setLastEvent({ type: 'DICE_ROLLED', data });
    });

    newSocket.on('TOKEN_MOVED', (data) => {
      setLastEvent({ type: 'TOKEN_MOVED', data });
    });

    newSocket.on('GAME_OVER', (data) => {
      setLastEvent({ type: 'GAME_OVER', data });
    });

    newSocket.on('CHAT_MESSAGE', (msg) => {
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          chatMessages: [...(prev.chatMessages || []), msg],
        };
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const emitWithTimeout = (eventName, data, timeoutMs = 7000) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not initialized. Please refresh page.'));
      if (!socket.connected) {
        console.log('🔄 CLIENT: Socket disconnected, triggering connect()...');
        socket.connect();
      }

      let timer = setTimeout(() => {
        console.error(`⏱️ CLIENT: Server request timed out for event: ${eventName}`);
        reject(new Error('Server request timed out. Please check server connection and try again.'));
      }, timeoutMs);

      console.log(`📤 CLIENT: Sending ${eventName} request to server...`, data);

      socket.emit(eventName, data, (response) => {
        clearTimeout(timer);
        console.log(`📥 CLIENT: Received response for ${eventName}:`, response);
        resolve(response);
      });
    });
  };

  const createRoom = async (gameType, options = {}) => {
    console.log('CREATE ROOM clicked for game:', gameType);
    const res = await emitWithTimeout('ROOM_CREATE', {
      gameType,
      isPrivate: options.isPrivate,
      password: options.password,
      maxPlayers: options.maxPlayers,
      user: profile,
    });

    if (res?.success) {
      console.log('Create room response received successfully:', res.roomCode);
      setRoomState(res.roomState);
      sessionStorage.setItem(
        'gameroom_session',
        JSON.stringify({ roomCode: res.roomCode, userId: profile?.id })
      );
      return res;
    } else {
      throw new Error(res?.error || 'Failed to create room.');
    }
  };

  const joinRoom = async (roomCode, password = '') => {
    console.log('JOIN ROOM clicked for code:', roomCode);
    const res = await emitWithTimeout('ROOM_JOIN', {
      roomCode,
      password,
      user: profile,
    });

    if (res?.success) {
      setRoomState(res.roomState);
      sessionStorage.setItem(
        'gameroom_session',
        JSON.stringify({ roomCode: res.roomCode, userId: profile?.id })
      );
      return res;
    } else {
      throw new Error(res?.error || 'Failed to join room.');
    }
  };

  const toggleReady = async () => {
    const res = await emitWithTimeout('PLAYER_READY', {});
    if (res?.success) return res;
    throw new Error(res?.error || 'Failed to toggle ready.');
  };

  const startGame = async () => {
    const res = await emitWithTimeout('GAME_START', {});
    if (res?.success) return res;
    throw new Error(res?.error || 'Failed to start game.');
  };

  const leaveRoom = async () => {
    sessionStorage.removeItem('gameroom_session');
    if (socket && socket.connected) {
      try {
        await emitWithTimeout('ROOM_LEAVE', {}, 3000);
      } catch (e) {}
    }
    setRoomState(null);
    setGameState(null);
  };

  const rollDice = async () => {
    const res = await emitWithTimeout('ROLL_DICE', {});
    if (res?.success) return res;
    throw new Error(res?.error || 'Failed to roll dice.');
  };

  const moveToken = async (tokenIndex) => {
    const res = await emitWithTimeout('MOVE_TOKEN', { tokenIndex });
    if (res?.success) return res;
    throw new Error(res?.error || 'Failed to move token.');
  };

  const sendChatMessage = async (message) => {
    const res = await emitWithTimeout('SEND_CHAT', { message });
    if (res?.success) return res;
    throw new Error(res?.error || 'Failed to send message.');
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        roomState,
        gameState,
        isReconnecting,
        lastDiceResult,
        lastEvent,
        createRoom,
        joinRoom,
        toggleReady,
        startGame,
        leaveRoom,
        rollDice,
        moveToken,
        sendChatMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
