import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SERVER_URL = import.meta.env.VITE_SERVER_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

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
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
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

    newSocket.on('disconnect', (reason) => {
      console.warn('❌ Socket disconnected:', reason);
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

  const createRoom = (gameType, options = {}) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not connected.'));
      socket.emit(
        'ROOM_CREATE',
        {
          gameType,
          isPrivate: options.isPrivate,
          password: options.password,
          maxPlayers: options.maxPlayers,
          user: profile,
        },
        (res) => {
          if (res?.success) {
            setRoomState(res.roomState);
            sessionStorage.setItem(
              'gameroom_session',
              JSON.stringify({ roomCode: res.roomCode, userId: profile?.id })
            );
            resolve(res);
          } else {
            reject(new Error(res?.error || 'Failed to create room.'));
          }
        }
      );
    });
  };

  const joinRoom = (roomCode, password = '') => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not connected.'));
      socket.emit(
        'ROOM_JOIN',
        {
          roomCode,
          password,
          user: profile,
        },
        (res) => {
          if (res?.success) {
            setRoomState(res.roomState);
            sessionStorage.setItem(
              'gameroom_session',
              JSON.stringify({ roomCode: res.roomCode, userId: profile?.id })
            );
            resolve(res);
          } else {
            reject(new Error(res?.error || 'Failed to join room.'));
          }
        }
      );
    });
  };

  const toggleReady = () => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not connected.'));
      socket.emit('PLAYER_READY', {}, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.error || 'Failed to toggle ready.'));
      });
    });
  };

  const startGame = () => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not connected.'));
      socket.emit('GAME_START', {}, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.error || 'Failed to start game.'));
      });
    });
  };

  const leaveRoom = () => {
    return new Promise((resolve) => {
      sessionStorage.removeItem('gameroom_session');
      if (socket) {
        socket.emit('ROOM_LEAVE', {}, () => {
          setRoomState(null);
          setGameState(null);
          resolve();
        });
      } else {
        setRoomState(null);
        setGameState(null);
        resolve();
      }
    });
  };

  const rollDice = () => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not connected.'));
      socket.emit('ROLL_DICE', {}, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.error || 'Failed to roll dice.'));
      });
    });
  };

  const moveToken = (tokenIndex) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not connected.'));
      socket.emit('MOVE_TOKEN', { tokenIndex }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.error || 'Failed to move token.'));
      });
    });
  };

  const sendChatMessage = (message) => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Socket not connected.'));
      socket.emit('SEND_CHAT', { message }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.error || 'Failed to send message.'));
      });
    });
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
