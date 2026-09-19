import React from 'react';

const COMMON_TRACK_COORDS = [
  { r: 6, c: 1 },  // 0 Red Start
  { r: 6, c: 2 },  // 1
  { r: 6, c: 3 },  // 2
  { r: 6, c: 4 },  // 3
  { r: 6, c: 5 },  // 4
  { r: 5, c: 6 },  // 5
  { r: 4, c: 6 },  // 6
  { r: 3, c: 6 },  // 7
  { r: 2, c: 6 },  // 8 Star
  { r: 1, c: 6 },  // 9
  { r: 0, c: 6 },  // 10
  { r: 0, c: 7 },  // 11
  { r: 0, c: 8 },  // 12
  { r: 1, c: 8 },  // 13 Green Start
  { r: 2, c: 8 },  // 14
  { r: 3, c: 8 },  // 15
  { r: 4, c: 8 },  // 16
  { r: 5, c: 8 },  // 17
  { r: 6, c: 9 },  // 18
  { r: 6, c: 10 }, // 19
  { r: 6, c: 11 }, // 20
  { r: 6, c: 12 }, // 21 Star
  { r: 6, c: 13 }, // 22
  { r: 6, c: 14 }, // 23
  { r: 7, c: 14 }, // 24
  { r: 8, c: 14 }, // 25
  { r: 8, c: 13 }, // 26 Yellow Start
  { r: 8, c: 12 }, // 27
  { r: 8, c: 11 }, // 28
  { r: 8, c: 10 }, // 29
  { r: 8, c: 9 },  // 30
  { r: 9, c: 8 },  // 31
  { r: 10, c: 8 }, // 32
  { r: 11, c: 8 }, // 33
  { r: 12, c: 8 }, // 34 Star
  { r: 13, c: 8 }, // 35
  { r: 14, c: 8 }, // 36
  { r: 14, c: 7 }, // 37
  { r: 14, c: 6 }, // 38
  { r: 13, c: 6 }, // 39 Blue Start
  { r: 12, c: 6 }, // 40
  { r: 11, c: 6 }, // 41
  { r: 10, c: 6 }, // 42
  { r: 9, c: 6 },  // 43
  { r: 8, c: 5 },  // 44
  { r: 8, c: 4 },  // 45
  { r: 8, c: 3 },  // 46
  { r: 8, c: 2 },  // 47 Star
  { r: 8, c: 1 },  // 48
  { r: 8, c: 0 },  // 49
  { r: 7, c: 0 },  // 50
  { r: 6, c: 0 },  // 51
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
  0: [ { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 3 } ], // Red
  1: [ { r: 2, c: 11 }, { r: 2, c: 12 }, { r: 3, c: 11 }, { r: 3, c: 12 } ], // Green
  2: [ { r: 12, c: 11 }, { r: 12, c: 12 }, { r: 11, c: 11 }, { r: 11, c: 12 } ], // Yellow
  3: [ { r: 12, c: 2 }, { r: 12, c: 3 }, { r: 11, c: 2 }, { r: 11, c: 3 } ], // Blue
};

export const Board = ({ gameState, onTokenClick, isMyTurn }) => {
  const currentPlayer = gameState?.currentPlayer;
  const validMoves = gameState?.validMoves || [];

  // Helper to convert step (0..56) to (row, col)
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

  // Build grid cell elements
  const cells = [];
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      let cellType = 'TRACK';
      let cellColorClass = 'bg-slate-900 border-slate-800/60';
      let isStar = false;

      // Yards (6x6 corners)
      if (r < 6 && c < 6) cellColorClass = 'bg-red-950/80 border-red-900/60'; // Red Yard
      else if (r < 6 && c > 8) cellColorClass = 'bg-emerald-950/80 border-emerald-900/60'; // Green Yard
      else if (r > 8 && c > 8) cellColorClass = 'bg-amber-950/80 border-amber-900/60'; // Yellow Yard
      else if (r > 8 && c < 6) cellColorClass = 'bg-blue-950/80 border-blue-900/60'; // Blue Yard

      // Center (3x3)
      else if (r >= 6 && r <= 8 && c >= 6 && c <= 8) {
        cellColorClass = 'bg-slate-950 border-purple-900/80';
      }

      // Colored Home Paths
      else if (r === 7 && c >= 1 && c <= 5) cellColorClass = 'bg-red-600 border-red-500/80';
      else if (c === 7 && r >= 1 && r <= 5) cellColorClass = 'bg-emerald-600 border-emerald-500/80';
      else if (r === 7 && c >= 9 && c <= 13) cellColorClass = 'bg-amber-500 border-amber-400/80';
      else if (c === 7 && r >= 9 && r <= 13) cellColorClass = 'bg-blue-600 border-blue-500/80';

      // Starting Squares
      else if (r === 6 && c === 1) cellColorClass = 'bg-red-700 border-red-600';
      else if (r === 1 && c === 8) cellColorClass = 'bg-emerald-700 border-emerald-600';
      else if (r === 8 && c === 13) cellColorClass = 'bg-amber-600 border-amber-500';
      else if (r === 13 && c === 6) cellColorClass = 'bg-blue-700 border-blue-600';

      // Check Star safe tiles
      const isSafeStar = COMMON_TRACK_COORDS.some(
        (coord, idx) => [8, 21, 34, 47].includes(idx) && coord.r === r && coord.c === c
      );
      if (isSafeStar) isStar = true;

      cells.push(
        <div
          key={`${r}_${c}`}
          className={`relative border flex items-center justify-center ${cellColorClass}`}
        >
          {isStar && <span className="text-[10px] sm:text-xs">⭐</span>}
        </div>
      );
    }
  }

  return (
    <div className="relative w-full aspect-square bg-slate-950 border-4 border-slate-800 rounded-2xl shadow-2xl overflow-hidden select-none">
      {/* 15x15 Ludo Grid Layout */}
      <div className="grid grid-cols-15 grid-rows-15 w-full h-full">
        {cells}
      </div>

      {/* Decorative Yard Boxes */}
      <div className="absolute top-[3.3%] left-[3.3%] w-[33.3%] h-[33.3%] border-4 border-red-600 rounded-xl bg-red-900/30 flex items-center justify-center">
        <span className="text-red-400 font-black text-xs sm:text-sm uppercase tracking-wider">RED</span>
      </div>
      <div className="absolute top-[3.3%] right-[3.3%] w-[33.3%] h-[33.3%] border-4 border-emerald-600 rounded-xl bg-emerald-900/30 flex items-center justify-center">
        <span className="text-emerald-400 font-black text-xs sm:text-sm uppercase tracking-wider">GREEN</span>
      </div>
      <div className="absolute bottom-[3.3%] right-[3.3%] w-[33.3%] h-[33.3%] border-4 border-amber-500 rounded-xl bg-amber-900/30 flex items-center justify-center">
        <span className="text-amber-400 font-black text-xs sm:text-sm uppercase tracking-wider">YELLOW</span>
      </div>
      <div className="absolute bottom-[3.3%] left-[3.3%] w-[33.3%] h-[33.3%] border-4 border-blue-600 rounded-xl bg-blue-900/30 flex items-center justify-center">
        <span className="text-blue-400 font-black text-xs sm:text-sm uppercase tracking-wider">BLUE</span>
      </div>

      {/* Center Home Triangle */}
      <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-slate-900 border-2 border-amber-400 rounded-xl flex items-center justify-center shadow-inner">
        <span className="text-xl sm:text-2xl">🏆</span>
      </div>

      {/* Render Player Tokens Layer */}
      {gameState?.players?.map((player) => {
        const colorHexMap = {
          0: '#EF4444', // Red
          1: '#10B981', // Green
          2: '#F59E0B', // Yellow
          3: '#3B82F6', // Blue
        };
        const colorHex = colorHexMap[player.colorIndex] || '#8B5CF6';

        return player.tokens.map((step, tIdx) => {
          const coords = getTokenCoords(player.colorIndex, step, tIdx);
          const isEligibleToMove =
            isMyTurn &&
            currentPlayer?.id === player.id &&
            gameState?.hasRolled &&
            validMoves.includes(tIdx);

          // Calculate percentage coordinates (each cell is 100 / 15 = 6.666%)
          const cellWidth = 100 / 15;
          const leftPct = coords.c * cellWidth + cellWidth / 2;
          const topPct = coords.r * cellWidth + cellWidth / 2;

          return (
            <button
              key={`${player.id}_token_${tIdx}`}
              onClick={() => isEligibleToMove && onTokenClick(tIdx)}
              disabled={!isEligibleToMove}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                backgroundColor: colorHex,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-[5%] h-[5%] rounded-full border-2 border-white shadow-md flex items-center justify-center transition-all duration-300 z-30 ${
                isEligibleToMove
                  ? 'ring-4 ring-amber-300 ring-offset-2 ring-offset-slate-950 scale-125 animate-pulse cursor-pointer'
                  : ''
              }`}
              title={`Token #${tIdx + 1} (${player.username})`}
            >
              <span className="text-[9px] font-black text-white">{tIdx + 1}</span>
            </button>
          );
        });
      })}
    </div>
  );
};
