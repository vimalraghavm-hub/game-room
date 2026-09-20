import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { ChatWidget } from '../components/ChatWidget';
import { SnakeLadderView } from '../games/snake-ladder/SnakeLadderView';
import { LudoView } from '../games/ludo/LudoView';
import { UnoView } from '../games/uno/UnoView';

export const RoomPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    roomState,
    isReconnecting,
    socket,
    toggleReady,
    startGame,
    leaveRoom,
  } = useSocket();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

  const me = roomState?.players?.find(
    (p) => p.id === socket?.id || p.userId === profile?.id
  );
  const isHost = me?.isHost;

  const handleCopyCode = () => {
    if (!roomState?.roomCode) return;
    navigator.clipboard.writeText(roomState.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!roomState?.roomCode) return;
    const url = `${window.location.origin}/join/${roomState.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLeave = async () => {
    await leaveRoom();
    navigate('/');
  };

  const handleToggleReady = async () => {
    try {
      await toggleReady();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartGame = async () => {
    setError('');
    setStarting(true);
    try {
      await startGame();
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  if (!roomState) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 font-mono text-[var(--text)]">
        <div className="term-box p-6 text-center max-w-sm w-full">
          <div className="text-xs font-bold text-[var(--accent)] mb-2">// CONNECTING TO ROOM...</div>
          <p className="text-[10px] opacity-70">SYNCHRONIZING SERVER GAME STATE</p>
        </div>
      </div>
    );
  }

  // Active Gameplay View
  if (roomState.status === 'PLAYING' || roomState.status === 'FINISHED') {
    return (
      <div className="min-h-screen pb-12 font-mono text-[var(--text)]">
        {/* Top Mini Header Bar */}
        <div className="border-b border-[var(--border)] bg-[var(--panel-bg)] px-4 py-2 sticky top-14 z-30">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 font-bold">
              <span className="text-[var(--accent)]">
                ROOM: {roomState.roomCode}
              </span>
              <span className="opacity-80">
                // {roomState.gameType === 'SNAKE_LADDER' ? 'SNAKE & LADDER' : roomState.gameType === 'LUDO' ? 'LUDO' : roomState.gameType === 'UNO_FLIP' ? 'UNO FLIP' : 'CLASSIC UNO'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="term-button px-2.5 py-1 text-[10px]"
              >
                {copiedLink ? '[ COPIED ]' : '[ INVITE LINK ]'}
              </button>
              <button
                onClick={handleLeave}
                className="px-2.5 py-1 text-[10px] border border-red-500 bg-red-950/40 text-red-300 hover:bg-red-950"
              >
                [ LEAVE ]
              </button>
            </div>
          </div>
        </div>

        {/* Reconnect Banner */}
        {isReconnecting && (
          <div className="bg-amber-600 text-slate-950 px-4 py-1.5 text-center text-xs font-bold">
            ⚠️ RECONNECTING TO GAME ROOM SERVER...
          </div>
        )}

        {/* Game Component */}
        {roomState.gameType === 'SNAKE_LADDER' ? (
          <SnakeLadderView roomState={roomState} />
        ) : roomState.gameType === 'LUDO' ? (
          <LudoView roomState={roomState} />
        ) : (
          <UnoView roomState={roomState} />
        )}
      </div>
    );
  }

  // Lobby View
  const canStart =
    roomState.players.length >= 2 &&
    roomState.players.every((p) => p.isReady);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-mono text-[var(--text)]">
      
      {/* Lobby Header Dossier */}
      <div className="term-box p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent)] mb-1">
            // MULTIPLAYER ROOM LOBBY
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--accent)]">
            ROOM CODE: <span className="underline">{roomState.roomCode}</span>
          </h2>
          <div className="text-xs opacity-70 mt-1 flex flex-wrap gap-3">
            <span>GAME: {roomState.gameType}</span>
            <span>CAPACITY: {roomState.players.length}/{roomState.maxPlayers}</span>
            {roomState.startingHandSize && <span>STARTING CARDS: {roomState.startingHandSize}</span>}
            {roomState.turnTimerDuration && <span>TIMER: {roomState.turnTimerDuration}s</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs font-bold">
          <button
            onClick={handleCopyCode}
            className="term-button px-3 py-2"
          >
            {copiedCode ? '[ COPIED ]' : '[ COPY CODE ]'}
          </button>
          <button
            onClick={handleCopyLink}
            className="term-button px-3 py-2"
          >
            {copiedLink ? '[ COPIED ]' : '[ COPY INVITE LINK ]'}
          </button>
          <button
            onClick={handleLeave}
            className="px-3 py-2 border border-red-500 bg-red-950/40 text-red-300 hover:bg-red-950"
          >
            [ LEAVE ]
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 border border-red-500 bg-red-950/60 text-red-300 text-xs">
          [ERROR]: {error}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Players List */}
        <div className="lg:col-span-2 term-box p-6 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4 text-xs font-bold">
              <span className="text-[var(--accent)]">[ CONNECTED PLAYERS ]</span>
              <span className="opacity-70">{roomState.players.length} / {roomState.maxPlayers}</span>
            </div>

            <div className="space-y-2">
              {roomState.players.map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-3 border flex items-center justify-between text-xs ${
                    p.isReady ? 'border-[var(--text)] bg-[var(--bg)]' : 'border-[var(--border)] opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[var(--accent)]">0{idx + 1} //</span>
                    <span>{p.avatar} {p.username}</span>
                    {p.isHost && <span className="text-[9px] border border-[var(--border)] px-1.5 py-0.5">[HOST]</span>}
                  </div>
                  <span className={`font-bold ${p.isReady ? 'text-[var(--accent)]' : 'opacity-50'}`}>
                    [{p.isReady ? 'READY' : 'WAITING'}]
                  </span>
                </div>
              ))}

              {[...Array(Math.max(0, roomState.maxPlayers - roomState.players.length))].map((_, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-dashed border-[var(--border)] text-center text-xs opacity-40"
                >
                  // WAITING FOR PLAYER TO CONNECT...
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="pt-4 border-t border-[var(--border)] space-y-3">
            <button
              onClick={handleToggleReady}
              className={`term-button w-full py-2.5 text-xs ${
                me?.isReady ? 'border-emerald-500 text-emerald-300' : ''
              }`}
            >
              {me?.isReady ? '[ ✓ YOU ARE READY (CLICK TO UNREADY) ]' : '[ CLICK TO BECOME READY ]'}
            </button>

            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!canStart || starting}
                className="term-button w-full py-3 text-sm font-bold border-[var(--text)] bg-[var(--border)] text-[var(--accent)] disabled:opacity-40"
              >
                {starting ? '[ INITIALIZING GAME... ]' : canStart ? '[ START GAME NOW 🚀 ]' : '[ WAITING FOR ALL PLAYERS TO BE READY ]'}
              </button>
            )}
          </div>
        </div>

        {/* Chat Widget */}
        <div className="lg:col-span-1">
          <ChatWidget messages={roomState.chatMessages} />
        </div>

      </div>

    </div>
  );
};
