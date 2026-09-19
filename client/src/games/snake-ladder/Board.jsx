import React from 'react';

export const Board = ({ gameState, snakes = {}, ladders = {} }) => {
  // Generate 100 squares in standard serpentine order
  // Row 10 (top): 100..91 (left to right)
  // Row 9: 81..90 (left to right)
  // Row 8: 80..71
  // Row 7: 61..70
  // Row 6: 60..51
  // Row 5: 41..50
  // Row 4: 40..31
  // Row 3: 21..30
  // Row 2: 20..11
  // Row 1 (bottom): 1..10
  const rows = [];
  for (let r = 9; r >= 0; r--) {
    const rowSquares = [];
    const isEvenRow = (9 - r) % 2 === 1; // Reverse order on alternating rows
    for (let c = 0; c < 10; c++) {
      let squareNum;
      if (isEvenRow) {
        squareNum = r * 10 + (10 - c);
      } else {
        squareNum = r * 10 + c + 1;
      }
      rowSquares.push(squareNum);
    }
    rows.push(rowSquares);
  }

  // Calculate center percentage coordinates (x%, y%) for a given square number (1..100)
  const getSquareCoordinates = (num) => {
    if (num < 1 || num > 100) return { x: 5, y: 95 };
    const zeroIndex = num - 1;
    const r = Math.floor(zeroIndex / 10);
    const c = zeroIndex % 10;
    const isEvenRow = r % 2 === 1;

    const colIndex = isEvenRow ? 9 - c : c;
    const rowIndex = 9 - r; // 0 at top, 9 at bottom

    const x = colIndex * 10 + 5; // center x %
    const y = rowIndex * 10 + 5; // center y %
    return { x, y };
  };

  return (
    <div className="relative w-full aspect-square bg-slate-900 border-4 border-purple-950 rounded-2xl shadow-2xl overflow-hidden select-none">
      {/* 10x10 Board Grid */}
      <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
        {rows.map((row, rIdx) =>
          row.map((num, cIdx) => {
            const isDark = (rIdx + cIdx) % 2 === 1;
            const isLadderStart = ladders[num];
            const isSnakeHead = snakes[num];

            return (
              <div
                key={num}
                className={`relative flex items-start justify-end p-1 border border-slate-800/40 text-[10px] sm:text-xs font-bold font-mono transition-colors ${
                  num === 100
                    ? 'bg-gradient-to-br from-amber-500/40 to-yellow-600/40 text-amber-300 font-black'
                    : isDark
                    ? 'bg-slate-800/80 text-slate-400'
                    : 'bg-slate-900/90 text-slate-500'
                }`}
              >
                {/* Square Number */}
                <span className={num === 100 ? 'text-amber-300 text-sm font-black' : ''}>{num}</span>

                {/* Ladder / Snake Indicator Icons */}
                {isLadderStart && (
                  <span className="absolute bottom-1 left-1 text-xs" title={`Ladder to ${ladders[num]}`}>
                    🪜
                  </span>
                )}
                {isSnakeHead && (
                  <span className="absolute bottom-1 left-1 text-xs" title={`Snake to ${snakes[num]}`}>
                    🐍
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SVG Layer for Snakes and Ladders Connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Draw Ladders (Green/Gold strokes) */}
        {Object.entries(ladders).map(([start, end]) => {
          const from = getSquareCoordinates(Number(start));
          const to = getSquareCoordinates(Number(end));
          return (
            <g key={`ladder_${start}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#10B981"
                strokeWidth="2.5"
                strokeDasharray="1 1"
                strokeLinecap="round"
                className="opacity-90"
              />
              <line
                x1={from.x + 0.8}
                y1={from.y}
                x2={to.x + 0.8}
                y2={to.y}
                stroke="#F59E0B"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Draw Snakes (Red curved lines) */}
        {Object.entries(snakes).map(([start, end]) => {
          const from = getSquareCoordinates(Number(start));
          const to = getSquareCoordinates(Number(end));
          const controlX = (from.x + to.x) / 2 + (from.x > to.x ? 8 : -8);
          const controlY = (from.y + to.y) / 2;
          return (
            <g key={`snake_${start}`}>
              <path
                d={`M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`}
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="opacity-90"
              />
              <circle cx={from.x} cy={from.y} r="1.8" fill="#DC2626" />
            </g>
          );
        })}
      </svg>

      {/* Players Tokens Layer */}
      {gameState?.players?.map((player, pIdx) => {
        const pos = player.position || 1;
        const coords = getSquareCoordinates(pos);

        // Stagger overlapping player tokens on the same square
        const sameSquarePlayers = gameState.players.filter(p => (p.position || 1) === pos);
        const playerOffsetIdx = sameSquarePlayers.findIndex(p => p.id === player.id);
        const offsets = [
          { dx: -1.8, dy: -1.8 },
          { dx: 1.8, dy: -1.8 },
          { dx: -1.8, dy: 1.8 },
          { dx: 1.8, dy: 1.8 },
        ];
        const offset = offsets[playerOffsetIdx % offsets.length] || { dx: 0, dy: 0 };

        const finalX = coords.x + offset.dx;
        const finalY = coords.y + offset.dy;

        return (
          <div
            key={player.id}
            className="absolute transition-all duration-500 ease-out z-20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${finalX}%`, top: `${finalY}%` }}
          >
            <div
              className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-black text-[9px] text-white animate-bounce-short"
              style={{ backgroundColor: player.color || '#EF4444' }}
              title={`${player.username} (Pos: ${pos})`}
            >
              {player.username.charAt(0).toUpperCase()}
            </div>
          </div>
        );
      })}
    </div>
  );
};
