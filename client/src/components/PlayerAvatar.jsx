import React from 'react';
import { Crown, CheckCircle2, Clock, WifiOff } from 'lucide-react';

export const PlayerAvatar = ({ player, isCurrentTurn, isHost, gameType, score }) => {
  const color = player.colorHex || player.color || '#3B82F6';

  return (
    <div
      className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
        isCurrentTurn
          ? 'bg-purple-950/40 border-purple-500 shadow-lg shadow-purple-500/20 scale-[1.02]'
          : 'bg-slate-900/80 border-slate-800'
      } ${!player.isConnected ? 'opacity-50' : ''}`}
    >
      {/* Player Color Accent Bar */}
      <div
        className="w-1.5 h-10 rounded-full"
        style={{ backgroundColor: color }}
      />

      {/* Avatar Image */}
      <div className="relative">
        <img
          src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.username}`}
          alt={player.username}
          className="w-11 h-11 rounded-full bg-slate-950 border-2 border-slate-700 shadow-md object-cover"
        />

        {player.isWinner && (
          <div className="absolute -top-2 -right-1 bg-amber-400 p-0.5 rounded-full text-slate-950 shadow-lg animate-bounce">
            <Crown className="w-4 h-4 fill-amber-950" />
          </div>
        )}

        {!player.isConnected && (
          <div className="absolute -bottom-1 -right-1 bg-red-600 p-1 rounded-full text-white" title="Disconnected">
            <WifiOff className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-100 truncate">{player.username}</span>
          {player.isHost && (
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Host
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
          {score !== undefined && (
            <span className="font-semibold text-slate-300">Pos: {score}</span>
          )}
          {player.rank && (
            <span className="text-amber-400 font-bold">Rank #{player.rank}</span>
          )}
          {!player.isHost && player.isReady !== undefined && (
            <div className="flex items-center gap-1">
              {player.isReady ? (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-semibold text-xs">
                  <Clock className="w-3.5 h-3.5" /> Waiting
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Current Turn Glow Badge */}
      {isCurrentTurn && (
        <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white shadow-md animate-pulse">
          TURN
        </span>
      )}
    </div>
  );
};
