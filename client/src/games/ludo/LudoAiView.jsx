import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Board } from './Board';
import { DiceRoller } from '../../components/DiceRoller';
import { chooseLudoMove, getLudoAiDelay } from '../../utils/ai/ludoAI';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';

const COLORS = ['Red', 'Green', 'Yellow', 'Blue'];
const COLOR_HEX = ['#EF4444', '#10B981', '#F59E0B', '#3B82F6'];
const BOT_NAMES = ['Bot Apex', 'Bot Bolt', 'Bot Cyra', 'Bot Dynamo'];

export default function LudoAiView(props) {
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
    const totalPlayers = 1 + aiCount;
    const players = [
      { id: 'p_human', userId: 'p_human', username: 'You', avatar: '🎮', color: COLORS[0], colorIndex: 0, colorHex: COLOR_HEX[0], tokens: [-1, -1, -1, -1], isAi: false },
    ];

    for (let i = 1; i < totalPlayers; i++) {
      players.push({
        id: `p_ai_${i}`,
        userId: `p_ai_${i}`,
        username: BOT_NAMES[i - 1],
        avatar: '🤖',
        color: COLORS[i],
        colorIndex: i,
        colorHex: COLOR_HEX[i],
        tokens: [-1, -1, -1, -1],
        isAi: true,
      });
    }

    setGameState({
      status: 'IN_PROGRESS',
      currentTurnIndex: 0,
      currentPlayer: players[0],
      players,
      diceValue: 1,
      hasRolled: false,
      validMoves: [],
      lastAction: 'Game started! Roll a 6 to open a token.',
      winner: null,
    });
  }

  // AI Turn Automation
  useEffect(() => {
    if (!gameState || gameState.status !== 'IN_PROGRESS') return;

    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (currentPlayer && currentPlayer.isAi) {
      const delay = getLudoAiDelay(difficulty);

      if (!gameState.hasRolled && !isRolling) {
        aiTimeoutRef.current = setTimeout(() => {
          handleRollDice();
        }, delay);
      } else if (gameState.hasRolled && gameState.validMoves.length > 0) {
        aiTimeoutRef.current = setTimeout(() => {
          const chosenToken = chooseLudoMove(gameState.validMoves, gameState, gameState.currentTurnIndex, gameState.diceValue, difficulty);
          if (chosenToken !== null) {
            handleMoveToken(chosenToken);
          }
        }, delay);
      }
    }
  }, [gameState, isRolling, difficulty]);

  const getValidMovesForRoll = (player, roll) => {
    const valid = [];
    player.tokens.forEach((step, idx) => {
      if (step === -1 && roll === 6) valid.push(idx);
      else if (step >= 0 && step + roll <= 56) valid.push(idx);
    });
    return valid;
  };

  const handleRollDice = () => {
    if (!gameState || gameState.status !== 'IN_PROGRESS' || isRolling || gameState.hasRolled) return;

    setIsRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setGameState(prev => {
        if (!prev || prev.status !== 'IN_PROGRESS') return prev;

        const player = prev.players[prev.currentTurnIndex];
        const validMoves = getValidMovesForRoll(player, roll);

        if (validMoves.length === 0) {
          // Auto pass turn if no legal moves available
          const nextIndex = (prev.currentTurnIndex + 1) % prev.players.length;
          return {
            ...prev,
            diceValue: roll,
            hasRolled: false,
            validMoves: [],
            currentTurnIndex: nextIndex,
            currentPlayer: prev.players[nextIndex],
            lastAction: `${player.username} rolled a ${roll} (No valid moves).`,
          };
        }

        return {
          ...prev,
          diceValue: roll,
          hasRolled: true,
          validMoves,
          lastAction: `${player.username} rolled a ${roll}! Select a token to move.`,
        };
      });

      setIsRolling(false);
    }, 600);
  };

  const handleMoveToken = (tokenIndex) => {
    if (!gameState || !gameState.hasRolled || !gameState.validMoves.includes(tokenIndex)) return;

    setGameState(prev => {
      const players = prev.players.map(p => ({ ...p, tokens: [...p.tokens] }));
      const player = players[prev.currentTurnIndex];
      const roll = prev.diceValue;

      const currentStep = player.tokens[tokenIndex];
      let newStep = currentStep === -1 ? 0 : currentStep + roll;
      player.tokens[tokenIndex] = newStep;

      let getsExtraTurn = roll === 6;
      let captured = null;
      let status = prev.status;
      let winner = prev.winner;
      let lastAction = `${player.username} moved token #${tokenIndex + 1}.`;

      // Check capture if non-safe square (0-51 step)
      if (newStep >= 0 && newStep <= 51) {
        const START_OFFSETS = [0, 13, 26, 39];
        const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];
        const globalPos = (START_OFFSETS[player.colorIndex] + newStep) % 52;

        if (!SAFE_SQUARES.includes(globalPos)) {
          players.forEach((opp, oppIdx) => {
            if (oppIdx !== prev.currentTurnIndex) {
              opp.tokens.forEach((oppStep, oppTokenIdx) => {
                if (oppStep >= 0 && oppStep <= 51) {
                  const oppGlobalPos = (START_OFFSETS[opp.colorIndex] + oppStep) % 52;
                  if (oppGlobalPos === globalPos) {
                    opp.tokens[oppTokenIdx] = -1; // Reset opponent token to yard!
                    captured = opp.username;
                    getsExtraTurn = true;
                  }
                }
              });
            }
          });
        }
      }

      if (captured) {
        lastAction += ` ⚔️ Captured ${captured}'s token! Extra turn granted.`;
      }

      // Check win condition (all 4 tokens at home step 56)
      if (player.tokens.every(t => t === 56)) {
        status = 'FINISHED';
        winner = player;
        lastAction = `🎉 ${player.username} brought all tokens Home and WON!`;
        if (player.id === 'p_human') {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }
      }

      let nextIndex = prev.currentTurnIndex;
      if (status !== 'FINISHED' && !getsExtraTurn) {
        nextIndex = (prev.currentTurnIndex + 1) % players.length;
      }

      return {
        ...prev,
        status,
        currentTurnIndex: nextIndex,
        currentPlayer: players[nextIndex],
        players,
        hasRolled: false,
        validMoves: [],
        lastAction,
        winner,
      };
    });
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
          onTokenClick={isMyTurn && gameState?.hasRolled ? handleMoveToken : undefined}
          validMoves={isMyTurn ? gameState?.validMoves || [] : []}
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
                <span className="font-bold text-base">{gameState?.currentPlayer?.username} ({gameState?.currentPlayer?.color})</span>
              </div>
              <p className="text-xs text-indigo-300 font-medium">{gameState?.lastAction}</p>

              <DiceRoller
                diceValue={gameState?.diceValue || 1}
                isRolling={isRolling}
                disabled={!isMyTurn || isRolling || gameState?.hasRolled}
                onRoll={handleRollDice}
              />
            </div>
          )}
        </div>

        {/* Players & Token Progress */}
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
                    <div className="font-bold text-xs">{p.username} ({p.color})</div>
                    <div className="text-[10px] text-slate-400">
                      Tokens Home: {p.tokens.filter(t => t === 56).length}/4
                    </div>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border border-white/30" style={{ backgroundColor: p.colorHex }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
