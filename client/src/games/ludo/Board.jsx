import React from 'react';

const COMMON_TRACK_COORDS = [
  { r: 6, c: 1 },  // 0 Red Start (Safe Star)
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
  { r: 1, c: 8 },  // 13 Green Start (Safe Star)
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
  { r: 8, c: 13 }, // 26 Yellow Start (Safe Star)
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
  { r: 13, c: 6 }, // 39 Blue Start (Safe Star)
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
  0: [ { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 3 } ], // Red (Top-Left)
  1: [ { r: 2, c: 11 }, { r: 2, c: 12 }, { r: 3, c: 11 }, { r: 3, c: 12 } ], // Green (Top-Right)
  2: [ { r: 12, c: 11 }, { r: 12, c: 12 }, { r: 11, c: 11 }, { r: 11, c: 12 } ], // Yellow (Bottom-Right)
  3: [ { r: 12, c: 2 }, { r: 12, c: 3 }, { r: 11, c: 2 }, { r: 11, c: 3 } ], // Blue (Bottom-Left)
};

export const Board = ({ gameState, onTokenClick, isMyTurn }) => {
  const currentPlayer = gameState?.currentPlayer;
  const validMoves = gameState?.validMoves || [];

  // Convert step (0..56) to (row, col)
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

  // Build grid cell elements for 15x15 Ludo board
  const cells = [];
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      let cellColorClass = 'bg-white border-slate-300';
      let isStar = false;
      let starColor = 'text-amber-500';

      // Yard Areas (6x6 Corners)
      if (r < 6 && c < 6) cellColorClass = 'bg-red-50 border-red-200'; // Red Yard Top-Left
      else if (r < 6 && c > 8) cellColorClass = 'bg-emerald-50 border-emerald-200'; // Green Yard Top-Right
      else if (r > 8 && c > 8) cellColorClass = 'bg-amber-50 border-amber-200'; // Yellow Yard Bottom-Right
      else if (r > 8 && c < 6) cellColorClass = 'bg-blue-50 border-blue-200'; // Blue Yard Bottom-Left

      // Center Finish Triangle (3x3)
      else if (r >= 6 && r <= 8 && c >= 6 && c <= 8) {
        cellColorClass = 'bg-amber-100 border-amber-300';
      }

      // Colored Home Paths
      else if (r === 7 && c >= 1 && c <= 5) cellColorClass = 'bg-red-500 border-red-600';
      else if (c === 7 && r >= 1 && r <= 5) cellColorClass = 'bg-emerald-500 border-emerald-600';
      else if (r === 7 && c >= 9 && c <= 13) cellColorClass = 'bg-amber-400 border-amber-500';
      else if (c === 7 && r >= 9 && r <= 13) cellColorClass = 'bg-blue-500 border-blue-600';

      // Starting Squares
      else if (r === 6 && c === 1) { cellColorClass = 'bg-red-500 border-red-600'; isStar = true; starColor = 'text-white'; }
      else if (r === 1 && c === 8) { cellColorClass = 'bg-emerald-500 border-emerald-600'; isStar = true; starColor = 'text-white'; }
      else if (r === 8 && c === 13) { cellColorClass = 'bg-amber-400 border-amber-500'; isStar = true; starColor = 'text-white'; }
      else if (r === 13 && c === 6) { cellColorClass = 'bg-blue-500 border-blue-600'; isStar = true; starColor = 'text-white'; }

      // Safe Star Squares
      const isSafeStar = COMMON_TRACK_COORDS.some(
        (coord, idx) => [8, 21, 34, 47].includes(idx) && coord.r === r && coord.c === c
      );
      if (isSafeStar) isStar = true;

      cells.push(
        <div
          key={`${r}_${c}`}
          className={`relative border-[0.5px] flex items-center justify-center ${cellColorClass}`}
        >
          {isStar && <span className={`text-[10px] sm:text-xs drop-shadow ${starColor}`}>⭐</span>}
        </div>
      );
    }
  }

  return (
    <div className="relative w-full aspect-square bg-amber-50 border-[6px] sm:border-[10px] border-amber-200 rounded-3xl shadow-2xl overflow-hidden select-none ring-4 ring-amber-400/40">
      
      {/* 15x15 Physical Ludo Board Grid */}
      <div className="grid grid-cols-15 grid-rows-15 w-full h-full">
        {cells}
      </div>

      {/* Illustrated Yard Quadrant Boxes */}
      {/* Red Yard (Top-Left) */}
      <div className="absolute top-[3.3%] left-[3.3%] w-[33.3%] h-[33.3%] border-4 border-red-500 rounded-2xl bg-red-500/20 shadow-inner flex items-center justify-center">
        <div className="grid grid-cols-2 grid-rows-2 gap-3 w-3/4 h-3/4 p-2 bg-white/90 rounded-xl shadow">
          <div className="rounded-full bg-red-100 border-2 border-red-400" />
          <div className="rounded-full bg-red-100 border-2 border-red-400" />
          <div className="rounded-full bg-red-100 border-2 border-red-400" />
          <div className="rounded-full bg-red-100 border-2 border-red-400" />
        </div>
      </div>

      {/* Green Yard (Top-Right) */}
      <div className="absolute top-[3.3%] right-[3.3%] w-[33.3%] h-[33.3%] border-4 border-emerald-500 rounded-2xl bg-emerald-500/20 shadow-inner flex items-center justify-center">
        <div className="grid grid-cols-2 grid-rows-2 gap-3 w-3/4 h-3/4 p-2 bg-white/90 rounded-xl shadow">
          <div className="rounded-full bg-emerald-100 border-2 border-emerald-400" />
          <div className="rounded-full bg-emerald-100 border-2 border-emerald-400" />
          <div className="rounded-full bg-emerald-100 border-2 border-emerald-400" />
          <div className="rounded-full bg-emerald-100 border-2 border-emerald-400" />
        </div>
      </div>

      {/* Yellow Yard (Bottom-Right) */}
      <div className="absolute bottom-[3.3%] right-[3.3%] w-[33.3%] h-[33.3%] border-4 border-amber-400 rounded-2xl bg-amber-400/20 shadow-inner flex items-center justify-center">
        <div className="grid grid-cols-2 grid-rows-2 gap-3 w-3/4 h-3/4 p-2 bg-white/90 rounded-xl shadow">
          <div className="rounded-full bg-amber-100 border-2 border-amber-400" />
          <div className="rounded-full bg-amber-100 border-2 border-amber-400" />
          <div className="rounded-full bg-amber-100 border-2 border-amber-400" />
          <div className="rounded-full bg-amber-100 border-2 border-amber-400" />
        </div>
      </div>

      {/* Blue Yard (Bottom-Left) */}
      <div className="absolute bottom-[3.3%] left-[3.3%] w-[33.3%] h-[33.3%] border-4 border-blue-500 rounded-2xl bg-blue-500/20 shadow-inner flex items-center justify-center">
        <div className="grid grid-cols-2 grid-rows-2 gap-3 w-3/4 h-3/4 p-2 bg-white/90 rounded-xl shadow">
          <div className="rounded-full bg-blue-100 border-2 border-blue-400" />
          <div className="rounded-full bg-blue-100 border-2 border-blue-400" />
          <div className="rounded-full bg-blue-100 border-2 border-blue-400" />
          <div className="rounded-full bg-blue-100 border-2 border-blue-400" />
        </div>
      </div>

      {/* Central Finishing Home Area */}
      <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-white border-2 border-amber-400 rounded-xl flex items-center justify-center shadow-md">
        <div className="w-full h-full relative overflow-hidden rounded-lg flex items-center justify-center">
          <span className="text-xl sm:text-2xl drop-shadow">🏆</span>
        </div>
      </div>

      {/* Interactive 3D Player Tokens Layer */}
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
                boxShadow: `0 3px 8px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.4)`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-[5.5%] h-[5.5%] rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-300 z-30 ${
                isEligibleToMove
                  ? 'ring-4 ring-amber-300 ring-offset-2 ring-offset-amber-50 scale-125 animate-pulse cursor-pointer'
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
