import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Board } from './Board';
import { DiceRoller } from '../../components/DiceRoller';
import { PlayerAvatar } from '../../components/PlayerAvatar';
import { getSnakeLadderAiDelay } from '../../utils/ai/snakeLadderAI';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';

const SNAKES = {
  99: 54, 91: 73, 87: 24, 62: 19, 53: 31, 48: 26, 38: 15, 17: 7
};

const LADDERS = {
  4: 25, 12: 46, 20: 70, 28: 84, 40: 59, 63: 81, 71: 92
};

const PLAYER_COLORS = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B'];
const BOT_NAMES = ['Bot Apex', 'Bot Bolt', 'Bot Cyra', 'Bot Dynamo'];

export default function SnakeLadderAiView(props) {
  const [searchParams] = useSearchParams();
  const difficulty = props.difficulty || searchParams.get('difficulty') || 'Normal';
  const aiCount = props.aiCount || parseInt(searchParams.get('aiCount') || '1', 10);
  const [gameState, setGameState] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const aiTimeoutRef = useRef(null);

  useEffect(() => {
    initGame();
    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [difficulty, aiCount]);

  function initGame() {
    const players = [
      { id: 'p_human', userId: 'p_human', username: 'You (Player 1)', avatar: '🎮', color: PLAYER_COLORS[0], position: 1, isAi: false },
    ];

    for (let i = 1; i <= aiCount; i++) {
      players.push({
        id: `p_ai_${i}`,
        userId: `p_ai_${i}`,
        username: BOT_NAMES[i - 1],
        avatar: '🤖',
        color: PLAYER_COLORS[i],
        position: 1,
        isAi: true,
      });
    }

    setGameState({
      status: 'IN_PROGRESS',
      currentTurnIndex: 0,
      currentPlayer: players[0],
      players,
      diceValue: 1,
      lastAction: 'Game started! Roll to move.',
      snakes: SNAKES,
      ladders: LADDERS,
      winner: null,
    });
  }

  // AI turn automation
  useEffect(() => {
    if (!gameState || gameState.status !== 'IN_PROGRESS') return;

    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (currentPlayer && currentPlayer.isAi && !isRolling) {
      const delay = getSnakeLadderAiDelay(difficulty);
      aiTimeoutRef.current = setTimeout(() => {
        handleRoll();
      }, delay);
    }
  }, [gameState, isRolling, difficulty]);

  const handleRoll = () => {
    if (!gameState || gameState.status !== 'IN_PROGRESS' || isRolling) return;

    setIsRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setGameState(prev => {
        if (!prev || prev.status !== 'IN_PROGRESS') return prev;

        const players = prev.players.map(p => ({ ...p }));
        const player = players[prev.currentTurnIndex];
        let newPos = player.position + roll;
        let snakeOrLadder = null;

        // Exact roll to 100 rule
        if (newPos > 100) {
          newPos = player.position; // Stay put
        } else {
          // Check snake or ladder
          if (SNAKES[newPos]) {
            snakeOrLadder = { type: 'snake', from: newPos, to: SNAKES[newPos] };
            newPos = SNAKES[newPos];
          } else if (LADDERS[newPos]) {
            snakeOrLadder = { type: 'ladder', from: newPos, to: LADDERS[newPos] };
            newPos = LADDERS[newPos];
          }
        }

        player.position = newPos;

        let status = prev.status;
        let winner = prev.winner;
        let lastAction = `${player.username} rolled a ${roll}!`;

        if (snakeOrLadder?.type === 'snake') {
          lastAction += ` 🐍 Bitten by snake down to ${newPos}!`;
        } else if (snakeOrLadder?.type === 'ladder') {
          lastAction += ` 🪜 Climbed ladder up to ${newPos}!`;
        }

        if (newPos === 100) {
          status = 'FINISHED';
          winner = player;
          lastAction = `🎉 ${player.username} reached tile 100 and WON!`;
          if (player.id === 'p_human') {
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          }
        }

        // Advance turn if game not finished (rolling 6 gives extra turn)
        let nextTurnIndex = prev.currentTurnIndex;
        if (status !== 'FINISHED' && roll !== 6) {
          nextTurnIndex = (prev.currentTurnIndex + 1) % players.length;
        }

        return {
          ...prev,
          status,
          currentTurnIndex: nextTurnIndex,
          currentPlayer: players[nextTurnIndex],
          players,
          diceValue: roll,
          lastAction,
          winner,
        };
      });

      setIsRolling(false);
    }, 600);
  };

  const isMyTurn = gameState && gameState.players[gameState.currentTurnIndex]?.id === 'p_human';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6 text-white">
      <div className="lg:col-span-2 flex flex-col items-center">
        <div className="mb-2 text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
          Single Player vs AI ({difficulty} Difficulty)
        </div>
        <Board
          gameState={gameState}
          snakes={SNAKES}
          ladders={LADDERS}
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-center">
          {gameState?.status === 'FINISHED' ? (
            <div className="space-y-2">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-black text-amber-400">
                🏆 {gameState?.winner?.username} WINS!
              </h3>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs uppercase font-bold tracking-wider text-slate-400">Current Turn</div>
              <div className="flex items-center justify-center gap-3 bg-slate-800/80 py-3 px-4 rounded-xl border border-slate-700">
                <span className="text-2xl">{gameState?.currentPlayer?.avatar}</span>
                <span className="font-bold text-base">{gameState?.currentPlayer?.username}</span>
              </div>
              <p className="text-xs text-indigo-300 font-medium">{gameState?.lastAction}</p>

              <DiceRoller
                diceValue={gameState?.diceValue || 1}
                isRolling={isRolling}
                disabled={!isMyTurn || isRolling}
                onRoll={handleRoll}
              />
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Players</h4>
          <div className="space-y-2">
            {gameState?.players.map((p, idx) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  gameState.currentTurnIndex === idx
                    ? 'bg-indigo-950/60 border-indigo-500'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p.avatar}</span>
                  <div>
                    <div className="font-bold text-xs">{p.username}</div>
                    <div className="text-[10px] text-slate-400">Tile #{p.position}</div>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: p.color }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
