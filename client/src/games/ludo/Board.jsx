import React, { useState, useEffect, useRef } from 'react';

const COMMON_TRACK_COORDS = [
  { r: 6, c: 1 },  // 0 Red Start
  { r: 6, c: 2 },  { r: 6, c: 3 },  { r: 6, c: 4 },  { r: 6, c: 5 },
  { r: 5, c: 6 },  { r: 4, c: 6 },  { r: 3, c: 6 },  { r: 2, c: 6 },  { r: 1, c: 6 },  { r: 0, c: 6 },
  { r: 0, c: 7 },  { r: 0, c: 8 },
  { r: 1, c: 8 },  // 13 Green Start
  { r: 2, c: 8 },  { r: 3, c: 8 },  { r: 4, c: 8 },  { r: 5, c: 8 },
  { r: 6, c: 9 },  { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
  { r: 7, c: 14 }, { r: 8, c: 14 },
  { r: 8, c: 13 }, // 26 Yellow Start
  { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
  { r: 9, c: 8 },  { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },
  { r: 14, c: 7 }, { r: 14, c: 6 },
  { r: 13, c: 6 }, // 39 Blue Start
  { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
  { r: 8, c: 5 },  { r: 8, c: 4 },  { r: 8, c: 3 },  { r: 8, c: 2 },  { r: 8, c: 1 },  { r: 8, c: 0 },
  { r: 7, c: 0 },  { r: 6, c: 0 },
];

const HOME_PATH_COORDS = {
  0: [ { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 } ], // Red
  1: [ { r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 } ], // Green
  2: [ { r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 } ], // Yellow
  3: [ { r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 } ], // Blue
};

const HOME_FINAL_COORDS = {
  0: { r: 7, c: 6 },
  1: { r: 6, c: 7 },
  2: { r: 7, c: 8 },
  3: { r: 8, c: 7 },
};

const YARD_TOKEN_SLOTS = {
  0: [ { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 3 } ],
  1: [ { r: 2, c: 11 }, { r: 2, c: 12 }, { r: 3, c: 11 }, { r: 3, c: 12 } ],
  2: [ { r: 12, c: 11 }, { r: 12, c: 12 }, { r: 11, c: 11 }, { r: 11, c: 12 } ],
  3: [ { r: 12, c: 2 }, { r: 12, c: 3 }, { r: 11, c: 2 }, { r: 11, c: 3 } ],
};

const TOKEN_PAWN_STYLES = {
  0: { main: '#991B1B', dark: '#450A0A', border: '#FCA5A5', label: 'R' }, // Red
  1: { main: '#065F46', dark: '#022C22', border: '#6EE7B7', label: 'G' }, // Green
  2: { main: '#B45309', dark: '#451A03', border: '#FDE68A', label: 'Y' }, // Yellow
  3: { main: '#1E40AF', dark: '#172554', border: '#93C5FD', label: 'B' }, // Blue
};

export const Board = ({ gameState, onTokenClick, validMoves = [] }) => {
  const [animatedSteps, setAnimatedSteps] = useState({});
  const animationTimersRef = useRef({});

  const currentPlayer = gameState?.currentPlayer;

  const getTokenCoords = (colorIndex, step, tokenIndex) => {
    if (step === -1) {
      return YARD_TOKEN_SLOTS[colorIndex]?.[tokenIndex] || { r: 0, c: 0 };
    }
    if (step >= 0 && step <= 50) {
      const startOffset = colorIndex * 13;
      const globalIdx = (startOffset + step) % 52;
      return COMMON_TRACK_COORDS[globalIdx];
    }
    if (step >= 51 && step <= 55) {
      const homePathIdx = step - 51;
      return HOME_PATH_COORDS[colorIndex]?.[homePathIdx] || { r: 7, c: 7 };
    }
    return HOME_FINAL_COORDS[colorIndex] || { r: 7, c: 7 };
  };

  // Step-by-step movement animation loop
  useEffect(() => {
    if (!gameState?.players) return;

    gameState.players.forEach(player => {
      player.tokens.forEach((targetStep, tIdx) => {
        const key = `${player.id}_${tIdx}`;
        const currentAnimStep = animatedSteps[key] !== undefined ? animatedSteps[key] : targetStep;

        if (currentAnimStep !== targetStep) {
          if (animationTimersRef.current[key]) {
            clearInterval(animationTimersRef.current[key]);
          }

          // If token captured (-1), reset instantly, else step square-by-square
          if (targetStep === -1) {
            setAnimatedSteps(prev => ({ ...prev, [key]: -1 }));
          } else {
            const stepDir = targetStep > currentAnimStep ? 1 : -1;
            let curr = currentAnimStep === -1 ? 0 : currentAnimStep;

            animationTimersRef.current[key] = setInterval(() => {
              curr += stepDir;
              setAnimatedSteps(prev => ({ ...prev, [key]: curr }));

              if (curr === targetStep) {
                clearInterval(animationTimersRef.current[key]);
              }
            }, 180);
          }
        }
      });
    });

    return () => {
      Object.values(animationTimersRef.current).forEach(timer => clearInterval(timer));
    };
  }, [gameState?.players]);

  return (
    <div className="relative w-full aspect-square border-4 border-[#3F2B1D] rounded-lg shadow-2xl overflow-hidden select-none bg-[#050807]">
      
      {/* Vintage Physical Ludo Board Image Background */}
      <img
        src="/assets/boards/ludo-vintage.jpg"
        alt="Vintage Ludo / Parcheesi Board"
        className="w-full h-full object-contain pointer-events-none"
      />

      {/* Interactive Player Tokens Layer */}
      {gameState?.players?.map((player) => {
        const colorIdx = player.colorIndex;
        const pawnStyle = TOKEN_PAWN_STYLES[colorIdx] || TOKEN_PAWN_STYLES[0];

        return player.tokens.map((realStep, tIdx) => {
          const key = `${player.id}_${tIdx}`;
          const displayStep = animatedSteps[key] !== undefined ? animatedSteps[key] : realStep;
          const coords = getTokenCoords(colorIdx, displayStep, tIdx);

          const isEligibleToMove =
            currentPlayer?.id === player.id &&
            gameState?.hasRolled &&
            validMoves.includes(tIdx);

          const cellWidth = 100 / 15;
          const leftPct = coords.c * cellWidth + cellWidth / 2;
          const topPct = coords.r * cellWidth + cellWidth / 2;

          return (
            <button
              key={key}
              onClick={() => isEligibleToMove && onTokenClick && onTokenClick(tIdx)}
              disabled={!isEligibleToMove}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-30 flex flex-col items-center justify-center ${
                isEligibleToMove
                  ? 'scale-125 z-40 cursor-pointer animate-pulse'
                  : ''
              }`}
              title={`${player.username} (Token ${pawnStyle.label}${tIdx + 1})`}
            >
              {/* Vintage Carved Wooden Counter Pawn */}
              <div className="relative w-5 h-7 sm:w-7 sm:h-9 flex flex-col items-center justify-end drop-shadow-xl">
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-black/40 shadow-inner mb-[-2px] z-10"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${pawnStyle.border}, ${pawnStyle.main}, ${pawnStyle.dark})`,
                  }}
                />
                <div
                  className="w-3.5 h-4 sm:w-5 sm:h-5 rounded-t-full border border-black/40 shadow-md flex items-center justify-center"
                  style={{
                    background: `linear-gradient(to bottom, ${pawnStyle.main}, ${pawnStyle.dark})`,
                  }}
                >
                  <span className="text-[7px] sm:text-[9px] font-black text-white/90 font-mono">
                    {pawnStyle.label}{tIdx + 1}
                  </span>
                </div>
                <div
                  className="w-4 h-1 sm:w-5 sm:h-1.5 rounded-full border border-black/60 shadow-md"
                  style={{
                    background: `linear-gradient(to right, #D97706, #FBBF24, #92400E)`,
                  }}
                />
              </div>
            </button>
          );
        });
      })}

    </div>
  );
};
