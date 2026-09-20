import React, { useEffect } from 'react';
import { Board } from './Board';
import { DiceRoller } from '../../components/DiceRoller';
import { useSocket } from '../../context/SocketContext';
import confetti from 'canvas-confetti';

export const SnakeLadderView = ({ roomState }) => {
  const { gameState, rollDice, socket } = useSocket();
  const currentPlayer = gameState?.currentPlayer;
  const isMyTurn = socket && currentPlayer && currentPlayer.id === socket.id;

  useEffect(() => {
    if (gameState?.status === 'FINISHED' && gameState?.winner) {
      confetti({
        particleCount: 100,
        spread: 70,
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-[var(--text)]">
      
      {/* Main Board Column */}
      <div className="lg:col-span-2 flex flex-col items-center space-y-2">
        <div className="term-box w-full p-2 text-[10px] font-bold text-[var(--accent)] flex items-center justify-between">
          <span>[ GAME_01 // VINTAGE SNAKE & LADDER BOARD ]</span>
          <span>GRID: 10x10 // ASSET: VINTAGE_01</span>
        </div>
        <Board gameState={gameState} />
      </div>

      {/* Control Side Panel */}
      <div className="flex flex-col gap-4">
        
        {/* Turn Status Panel */}
        <div className="term-box p-4 text-center">
          {gameState?.status === 'FINISHED' ? (
            <div className="space-y-1">
              <div className="text-xl">🏆</div>
              <h3 className="text-sm font-bold text-[var(--accent)]">
                {gameState?.winner?.username.toUpperCase()} WINS!
              </h3>
              <p className="text-[10px] opacity-70">// MATCH COMPLETED</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[10px] uppercase font-bold opacity-70">CURRENT TURN</div>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--accent)]">
                <span>{currentPlayer?.avatar || '👤'}</span>
                <span>{currentPlayer?.username}</span>
              </div>

              {isMyTurn ? (
                <div className="text-[10px] font-bold text-[var(--accent)] border border-[var(--text)] bg-[var(--border)] py-1 animate-pulse">
                  [ YOUR TURN - ROLL DICE ]
                </div>
              ) : (
                <div className="text-[10px] opacity-60 py-1">
                  WAITING FOR {currentPlayer?.username?.toUpperCase()}...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dice Controls */}
        <div className="term-box p-4 flex flex-col items-center justify-center">
          <DiceRoller
            value={gameState?.diceValue}
            onRoll={handleRollDice}
            disabled={gameState?.status === 'FINISHED'}
            isMyTurn={isMyTurn}
          />
        </div>

        {/* Players List */}
        <div className="term-box p-4 space-y-2 text-xs">
          <div className="font-bold text-[var(--accent)] border-b border-[var(--border)] pb-1 text-[11px]">
            [ PLAYERS POSITIONS ]
          </div>
          <div className="space-y-1.5">
            {gameState?.players?.map((p, idx) => (
              <div
                key={p.id}
                className={`p-2 border flex items-center justify-between text-[11px] ${
                  currentPlayer?.id === p.id ? 'border-[var(--text)] bg-[var(--bg)] font-bold' : 'border-[var(--border)] opacity-80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{p.avatar || '👤'}</span>
                  <span>{p.username}</span>
                </div>
                <span className="font-mono text-[var(--accent)]">TILE #{p.position || 1}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
