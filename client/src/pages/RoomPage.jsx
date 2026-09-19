import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { ChatWidget } from '../components/ChatWidget';
import { SnakeLadderView } from '../games/snake-ladder/SnakeLadderView';
import { LudoView } from '../games/ludo/LudoView';
import {
  Copy,
  Check,
  LogOut,
  Play,
  CheckCircle2,
  Users,
  ShieldAlert,
  WifiOff,
  Sparkles,
} from 'lucide-react';

export const RoomPage = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    roomState,
    connected,
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-bold text-slate-200">Connecting to Room...</h3>
        <p className="text-slate-400 text-sm mt-1">Synchronizing game room state</p>
      </div>
    );
  }

  // Active Gameplay View
  if (roomState.status === 'PLAYING' || roomState.status === 'FINISHED') {
    return (
      <div className="min-h-screen pb-12">
        {/* Top Mini Header Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 sticky top-16 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono font-black text-purple-400 text-lg tracking-wider">
                ROOM: {roomState.roomCode}
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2.5 py-1 rounded-full uppercase">
                {roomState.gameType === 'SNAKE_LADDER' ? '🎲 Snake & Ladder' : '🟢 Ludo'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyLink}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'Copied Link!' : 'Invite Link'}
              </button>
              <button
                onClick={handleLeave}
                className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 border border-red-500/30 px-3 py-1.5 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" /> Leave
              </button>
            </div>
          </div>
        </div>

        {/* Reconnect Banner */}
        {isReconnecting && (
          <div className="bg-amber-600 text-slate-950 px-4 py-2 text-center text-xs font-black flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 animate-bounce" /> Connection lost. Reconnecting to game room...
          </div>
        )}

        {/* Game Component */}
        {roomState.gameType === 'SNAKE_LADDER' ? (
          <SnakeLadderView roomState={roomState} />
        ) : (
          <LudoView roomState={roomState} />
        )}
      </div>
    );
  }

  // Lobby View
  const canStart =
    roomState.players.length >= 2 &&
    roomState.players.every((p) => p.isReady);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Lobby Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Multiplayer Lobby
            </span>
            <span className="text-xs font-bold text-slate-400">
              {roomState.gameType === 'SNAKE_LADDER' ? '🎲 Snake & Ladder' : '🟢 Ludo'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
            ROOM CODE: <span className="font-mono text-purple-400 tracking-wider">{roomState.roomCode}</span>
          </h2>
        </div>

        {/* Room Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCopyCode}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-400" />}
            {copiedCode ? 'COPIED CODE' : 'COPY CODE'}
          </button>

          <button
            onClick={handleCopyLink}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-bold border border-purple-500/40 transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copiedLink ? 'COPIED LINK' : 'COPY INVITE LINK'}
          </button>

          <button
            onClick={handleLeave}
            className="px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-950/80 text-red-400 hover:text-red-300 text-xs font-bold border border-red-500/30 transition-all"
          >
            LEAVE
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center gap-3 text-red-300 text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Lobby Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Players List (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6">
          
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-extrabold text-white">Joined Players</h3>
              </div>
              <span className="text-sm font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                {roomState.players.length} / {roomState.maxPlayers}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roomState.players.map((p) => (
                <PlayerAvatar
                  key={p.id}
                  player={p}
                  isHost={p.isHost}
                  gameType={roomState.gameType}
                />
              ))}

              {/* Empty Slots */}
              {[...Array(Math.max(0, roomState.maxPlayers - roomState.players.length))].map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center p-6 border-2 border-dashed border-slate-800 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-wider"
                >
                  Waiting for player...
                </div>
              ))}
            </div>
          </div>

          {/* Player Ready / Host Start Controls */}
          <div className="pt-6 border-t border-slate-800 space-y-4">
            
            {/* Ready Toggle Button for Current Player */}
            <button
              onClick={handleToggleReady}
              className={`w-full py-3.5 rounded-2xl font-extrabold text-base shadow-xl flex items-center justify-center gap-2 transition-all ${
                me?.isReady
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              {me?.isReady ? '✓ YOU ARE READY! (CLICK TO UNREADY)' : 'CLICK TO BECOME READY'}
            </button>

            {/* Host Start Game Control */}
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!canStart || starting}
                className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all ${
                  canStart && !starting
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30 hover:scale-[1.02]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Play className="w-6 h-6 fill-current" />
                {starting
                  ? 'STARTING GAME...'
                  : canStart
                  ? 'START GAME NOW 🚀'
                  : roomState.players.length < 2
                  ? `WAITING FOR PLAYERS (${roomState.players.length}/${roomState.maxPlayers})`
                  : 'WAITING FOR ALL PLAYERS TO BE READY'}
              </button>
            )}

            {!isHost && canStart && (
              <div className="text-center text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 py-2.5 rounded-xl animate-pulse">
                ALL PLAYERS READY! WAITING FOR HOST TO START GAME...
              </div>
            )}
          </div>

        </div>

        {/* Chat Sidebar (1 col) */}
        <div className="lg:col-span-1">
          <ChatWidget messages={roomState.chatMessages} />
        </div>

      </div>

    </div>
  );
};
