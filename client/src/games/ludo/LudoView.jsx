import React, { useEffect } from 'react';
import { Board } from './Board';
import { DiceRoller } from '../../components/DiceRoller';
import { useSocket } from '../../context/SocketContext';
import confetti from 'canvas-confetti';

export const LudoView = ({ roomState }) => {
  const { gameState, rollDice, moveToken, socket } = useSocket();
  const currentPlayer = gameState?.currentPlayer;
  const isMyTurn = socket && currentPlayer && currentPlayer.id === socket.id;

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
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-[var(--text)]">
      
      {/* Main Board Column */}
      <div className="lg:col-span-2 flex flex-col items-center space-y-2">
        <div className="term-box w-full p-2 text-[10px] font-bold text-[var(--accent)] flex items-center justify-between">
          <span>[ GAME_02 // VINTAGE PARCHEESI / LUDO BOARD ]</span>
          <span>GRID: 15x15 // ASSET: VINTAGE_02</span>
        </div>
        <Board
          gameState={gameState}
          onTokenClick={handleTokenClick}
          validMoves={gameState?.validMoves || []}
        />
      </div>

      {/* Side Control Panel */}
      <div className="flex flex-col gap-4">
        
        {/* Turn Status Panel */}
        <div className="term-box p-4 text-center">
          {gameState?.status === 'FINISHED' ? (
            <div className="space-y-1">
              <div className="text-xl">🏆</div>
              <h3 className="text-sm font-bold text-[var(--accent)]">
                {gameState?.winner?.username.toUpperCase()} WINS LUDO!
              </h3>
              <p className="text-[10px] opacity-70">// MATCH COMPLETED</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[10px] uppercase font-bold opacity-70">CURRENT TURN</div>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--accent)]">
                <span>{currentPlayer?.avatar || '👤'}</span>
                <span>{currentPlayer?.username} ({currentPlayer?.color})</span>
              </div>

              {isMyTurn ? (
                <div className="text-[10px] font-bold text-[var(--accent)] border border-[var(--text)] bg-[var(--border)] py-1 animate-pulse">
                  {!gameState?.hasRolled ? '[ ROLL DICE ]' : '[ SELECT TOKEN TO MOVE ]'}
                </div>
              ) : (
                <div className="text-[10px] opacity-60 py-1">
                  WAITING FOR {currentPlayer?.username?.toUpperCase()}...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dice Roller */}
        <div className="term-box p-4 flex flex-col items-center justify-center">
          <DiceRoller
            value={gameState?.diceValue}
            onRoll={handleRollDice}
            disabled={gameState?.status === 'FINISHED' || gameState?.hasRolled}
            isMyTurn={isMyTurn && !gameState?.hasRolled}
          />
        </div>

        {/* Players Token Progress */}
        <div className="term-box p-4 space-y-2 text-xs">
          <div className="font-bold text-[var(--accent)] border-b border-[var(--border)] pb-1 text-[11px]">
            [ PLAYERS & TOKEN PROGRESS ]
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
                  <span>{p.username} ({p.color})</span>
                </div>
                <span className="font-mono text-[var(--accent)]">
                  HOME: {p.tokens.filter(t => t === 56).length}/4
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
