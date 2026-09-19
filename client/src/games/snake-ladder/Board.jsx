import React from 'react';

// Color palette for alternating vibrant squares
const SQUARE_COLORS = [
  '#F472B6', // Pink
  '#38BDF8', // Cyan
  '#34D399', // Emerald
  '#FBBF24', // Amber
  '#A78BFA', // Violet
  '#FB923C', // Orange
  '#A3E635', // Lime
  '#2DD4BF', // Teal
  '#FB7185', // Rose
  '#818CF8', // Indigo
];

export const Board = ({ gameState, snakes = {}, ladders = {} }) => {
  /**
   * Convert position (1..100) to grid row (0..9, 0=bottom) and col (0..9, 0=left)
   * Position 1 = (row 0, col 0) [bottom-left]
   * Position 10 = (row 0, col 9) [bottom-right]
   * Position 11 = (row 1, col 9) [row 2 right]
   * Position 20 = (row 1, col 0) [row 2 left]
   * ...
   * Position 100 = (row 9, col 0) [top-left]
   */
  const getPositionCoords = (pos) => {
    if (pos < 1) pos = 1;
    if (pos > 100) pos = 100;

    const zeroIdx = pos - 1;
    const r = Math.floor(zeroIdx / 10); // 0 at bottom, 9 at top
    const rem = zeroIdx % 10;
    const c = (r % 2 === 0) ? rem : (9 - rem); // Even rows left-to-right, odd rows right-to-left

    return { r, c };
  };

  /**
   * Calculate SVG percentage coordinates (x%, y%) for position 1..100
   * x: 0% at left, 100% at right
   * y: 0% at top, 100% at bottom
   */
  const getCenterCoords = (pos) => {
    const { r, c } = getPositionCoords(pos);
    const x = c * 10 + 5;
    const y = (9 - r) * 10 + 5; // Invert r for y (0 at top)
    return { x, y };
  };

  // Generate 100 grid cells for rendering (Row 9 top down to Row 0 bottom)
  const gridRows = [];
  for (let r = 9; r >= 0; r--) {
    const rowCells = [];
    const isOddRowFromBottom = r % 2 === 1; // r=1,3,5,7,9 are right-to-left
    for (let c = 0; c < 10; c++) {
      const colIdx = isOddRowFromBottom ? (9 - c) : c;
      const squareNum = r * 10 + colIdx + 1;
      rowCells.push(squareNum);
    }
    gridRows.push(rowCells);
  }

  // Helper to render ladder SVG graphics
  const renderLadder = (start, end) => {
    const from = getCenterCoords(Number(start));
    const to = getCenterCoords(Number(end));

    // Angle and perpendicular offsets for ladder rungs
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len * 1.5; // offset for side rails %
    const ny = dx / len * 1.5;

    // Generate 6-8 rungs along the ladder
    const rungCount = Math.max(4, Math.floor(len / 4));
    const rungs = [];
    for (let i = 1; i < rungCount; i++) {
      const t = i / rungCount;
      const rx = from.x + dx * t;
      const ry = from.y + dy * t;
      rungs.push({
        x1: rx - nx,
        y1: ry - ny,
        x2: rx + nx,
        y2: ry + ny,
      });
    }

    return (
      <g key={`ladder_${start}_${end}`} className="drop-shadow-md">
        {/* Rail 1 */}
        <line
          x1={from.x - nx}
          y1={from.y - ny}
          x2={to.x - nx}
          y2={to.y - ny}
          stroke="#D97706"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Rail 2 */}
        <line
          x1={from.x + nx}
          y1={from.y + ny}
          x2={to.x + nx}
          y2={to.y + ny}
          stroke="#D97706"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Rungs */}
        {rungs.map((rung, idx) => (
          <line
            key={idx}
            x1={rung.x1}
            y1={rung.y1}
            x2={rung.x2}
            y2={rung.y2}
            stroke="#F59E0B"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        ))}
      </g>
    );
  };

  // Helper to render snake SVG graphics
  const renderSnake = (start, end) => {
    const head = getCenterCoords(Number(start));
    const tail = getCenterCoords(Number(end));

    const midX = (head.x + tail.x) / 2 + (head.x > tail.x ? 12 : -12);
    const midY = (head.y + tail.y) / 2;

    const pathData = `M ${head.x} ${head.y} Q ${midX} ${midY} ${tail.x} ${tail.y}`;

    return (
      <g key={`snake_${start}_${end}`} className="drop-shadow-lg">
        {/* Outer Snake Body */}
        <path
          d={pathData}
          fill="none"
          stroke="#059669"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Inner Snake Pattern */}
        <path
          d={pathData}
          fill="none"
          stroke="#34D399"
          strokeWidth="1.4"
          strokeDasharray="1.5 1.5"
          strokeLinecap="round"
        />
        {/* Snake Head at Start */}
        <circle cx={head.x} cy={head.y} r="2.2" fill="#047857" />
        <circle cx={head.x - 0.6} cy={head.y - 0.6} r="0.6" fill="#FFFFFF" />
        <circle cx={head.x + 0.6} cy={head.y - 0.6} r="0.6" fill="#FFFFFF" />
        {/* Snake Tongue */}
        <line x1={head.x} y1={head.y} x2={head.x} y2={head.y - 2.5} stroke="#EF4444" strokeWidth="0.6" />
      </g>
    );
  };

  return (
    <div className="relative w-full aspect-square bg-amber-50 border-[6px] sm:border-[10px] border-amber-200 rounded-3xl shadow-2xl overflow-hidden select-none ring-4 ring-amber-400/40">
      
      {/* 10x10 Colorful Physical Grid */}
      <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
        {gridRows.map((row, rIdx) =>
          row.map((sqNum) => {
            const colorIdx = (sqNum - 1) % SQUARE_COLORS.length;
            const bgColor = SQUARE_COLORS[colorIdx];
            const is100 = sqNum === 100;

            return (
              <div
                key={sqNum}
                style={{ backgroundColor: is100 ? '#F59E0B' : bgColor }}
                className={`relative flex items-start justify-start p-1 border-[0.5px] border-slate-900/10 transition-colors ${
                  is100 ? 'ring-2 ring-amber-400 shadow-inner' : ''
                }`}
              >
                {/* Cell Number Badge */}
                <span
                  className={`font-black text-[9px] sm:text-xs font-game leading-none shadow-sm drop-shadow ${
                    is100 ? 'text-slate-950 text-sm animate-pulse' : 'text-slate-900/80'
                  }`}
                >
                  {sqNum === 100 ? '🏆 100' : sqNum}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* SVG Layer for Illustrated Snakes & Ladders */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Ladders */}
        {Object.entries(ladders).map(([start, end]) => renderLadder(start, end))}

        {/* Snakes */}
        {Object.entries(snakes).map(([start, end]) => renderSnake(start, end))}
      </svg>

      {/* Interactive Player Tokens Overlay Layer */}
      {gameState?.players?.map((player) => {
        const pos = player.position || 1;
        const coords = getCenterCoords(pos);

        // Calculate offset for overlapping tokens on the same square
        const sameSquarePlayers = gameState.players.filter((p) => (p.position || 1) === pos);
        const playerOffsetIdx = sameSquarePlayers.findIndex((p) => p.id === player.id);
        const offsets = [
          { dx: -2.2, dy: -2.2 },
          { dx: 2.2, dy: -2.2 },
          { dx: -2.2, dy: 2.2 },
          { dx: 2.2, dy: 2.2 },
        ];
        const offset = offsets[playerOffsetIdx % offsets.length] || { dx: 0, dy: 0 };

        const finalX = coords.x + offset.dx;
        const finalY = coords.y + offset.dy;

        const tokenColor = player.color || '#EF4444';

        return (
          <div
            key={player.id}
            className="absolute transition-all duration-500 ease-in-out z-20 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${finalX}%`, top: `${finalY}%` }}
          >
            {/* 3D Circular Token */}
            <div
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center font-black text-[10px] sm:text-xs text-white transform hover:scale-125 transition-transform"
              style={{
                backgroundColor: tokenColor,
                boxShadow: `0 4px 10px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.4)`,
              }}
              title={`${player.username} (Square: ${pos})`}
            >
              {player.username.charAt(0).toUpperCase()}
            </div>
          </div>
        );
      })}

    </div>
  );
};
