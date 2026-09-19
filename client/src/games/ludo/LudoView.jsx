import React, { useEffect } from 'react';
import { Board } from './Board';
import { DiceRoller } from '../../components/DiceRoller';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { useSocket } from '../../context/SocketContext';
import confetti from 'canvas-confetti';
import { Trophy, History, ShieldAlert } from 'lucide-react';

export const LudoView = ({ roomState }) => {
  const { gameState, rollDice, moveToken, socket } = useSocket();

  const currentPlayer = gameState?.currentPlayer;
  const isMyTurn = socket && currentPlayer && currentPlayer.id === socket.id;

  // Trigger confetti when game ends with winner
  useEffect(() => {
    if (gameState?.status === 'FINISHED' && gameState?.winner) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [gameState?.status, gameState?.winner]);

  const handleRollDice = async () => {
    if (!isMyTurn) return;
    try {
      await rollDice();
    } catch (err) {
      console.error('Roll dice error:', err);
    }
  };

  const handleTokenClick = async (tokenIndex) => {
    if (!isMyTurn || !gameState?.hasRolled) return;
    try {
      await moveToken(tokenIndex);
    } catch (err) {
      console.error('Move token error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Ludo Board Column */}
      <div className="lg:col-span-2 flex flex-col items-center">
        <Board
          gameState={gameState}
          onTokenClick={handleTokenClick}
          isMyTurn={isMyTurn}
        />
      </div>

      {/* Control Side Panel */}
      <div className="flex flex-col gap-6">
        
        {/* Turn Status Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-center relative overflow-hidden">
          {gameState?.status === 'FINISHED' ? (
            <div className="space-y-2">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-black text-amber-400">
                🏆 {gameState?.winner?.username} WINS LUDO!
              </h3>
              <p className="text-xs text-slate-400">Match completed successfully.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Turn
              </span>
              <div className="flex items-center justify-center gap-3">
                <img
                  src={currentPlayer?.avatar}
                  alt={currentPlayer?.username}
                  className="w-10 h-10 rounded-full border-2 border-purple-500 bg-slate-950"
                />
                <span className="text-lg font-black text-slate-100">
                  {currentPlayer?.username}
                </span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: currentPlayer?.colorHex || '#EF4444' }}
                >
                  {currentPlayer?.color}
                </span>
              </div>

              {isMyTurn ? (
                <div className="space-y-1">
                  {!gameState?.hasRolled ? (
                    <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/40 animate-pulse">
                      Roll the Dice 🎲
                    </span>
                  ) : (
                    <span className="inline-block bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/40 animate-bounce">
                      Select a highlighted token to move! ♟️
                    </span>
                  )}
                </div>
              ) : (
                <span className="inline-block bg-slate-800 text-slate-400 text-xs font-semibold px-3 py-1 rounded-full">
                  Waiting for {currentPlayer?.username}...
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dice Roller */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center">
          <DiceRoller
            value={gameState?.diceValue}
            onRoll={handleRollDice}
            disabled={gameState?.status === 'FINISHED' || gameState?.hasRolled}
            isMyTurn={isMyTurn && !gameState?.hasRolled}
          />
        </div>

        {/* Players List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Players ({gameState?.players?.length || 0})
          </h4>
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {gameState?.players?.map((p) => (
              <PlayerAvatar
                key={p.id}
                player={p}
                isCurrentTurn={currentPlayer?.id === p.id}
              />
            ))}
          </div>
        </div>

        {/* Game Log Feed */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl flex-1 flex flex-col min-h-[180px]">
          <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
            <History className="w-4 h-4 text-purple-400" />
            Ludo Action Log
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 text-xs max-h-[160px]">
            {gameState?.gameLog?.slice().reverse().map((log) => (
              <div key={log.id} className="text-slate-300 flex items-start gap-2">
                <span className="text-[10px] text-slate-500 mt-0.5">{log.timestamp}</span>
                <span className="flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
