import React, { useState, useEffect, useRef } from 'react';

// Vintage pawn color palettes (Muted Red, Muted Green, Muted Blue, Muted Gold/Yellow)
const PAWN_STYLES = [
  { main: '#B91C1C', dark: '#7F1D1D', label: 'P1', border: '#FCA5A5' },
  { main: '#047857', dark: '#064E3B', label: 'P2', border: '#6EE7B7' },
  { main: '#1D4ED8', dark: '#1E3A8A', label: 'P3', border: '#93C5FD' },
  { main: '#B45309', dark: '#78350F', label: 'P4', border: '#FDE68A' },
];

export const Board = ({ gameState }) => {
  const [animatedPositions, setAnimatedPositions] = useState({});
  const animationTimersRef = useRef({});

  /**
   * Convert position (1..100) to grid coordinates (percentage)
   * 1 = (row 0, col 0) [bottom-left]
   * 10 = (row 0, col 9) [bottom-right]
   * 11 = (row 1, col 9) [row 2 right]
   * 20 = (row 1, col 0) [row 2 left]
   * 100 = (row 9, col 0) [top-left]
   */
  const getCenterCoords = (pos) => {
    if (pos < 1) pos = 1;
    if (pos > 100) pos = 100;

    const zeroIdx = pos - 1;
    const r = Math.floor(zeroIdx / 10);
    const rem = zeroIdx % 10;
    const c = (r % 2 === 0) ? rem : (9 - rem);

    const x = c * 10 + 5;
    const y = (9 - r) * 10 + 5;
    return { x, y };
  };

  // Step-by-step movement animation loop
  useEffect(() => {
    if (!gameState?.players) return;

    gameState.players.forEach((player, pIdx) => {
      const targetPos = player.position || 1;
      const currentAnimPos = animatedPositions[player.id] || 1;

      if (currentAnimPos !== targetPos) {
        if (animationTimersRef.current[player.id]) {
          clearInterval(animationTimersRef.current[player.id]);
        }

        const stepDir = targetPos > currentAnimPos ? 1 : -1;
        let curr = currentAnimPos;

        animationTimersRef.current[player.id] = setInterval(() => {
          curr += stepDir;
          setAnimatedPositions(prev => ({ ...prev, [player.id]: curr }));

          if (curr === targetPos) {
            clearInterval(animationTimersRef.current[player.id]);
          }
        }, 180);
      }
    });

    return () => {
      Object.values(animationTimersRef.current).forEach(timer => clearInterval(timer));
    };
  }, [gameState?.players]);

  return (
    <div className="relative w-full aspect-square border-4 border-[#3F2B1D] rounded-lg shadow-2xl overflow-hidden select-none bg-[#050807]">
      
      {/* Vintage Physical Board Image Background */}
      <img
        src="/assets/boards/snake-ladder-vintage.jpg"
        alt="Vintage Snake & Ladder Board"
        className="w-full h-full object-contain pointer-events-none"
      />

      {/* Transparent 10x10 Logical Interactive Grid Overlay */}
      <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 w-full h-full pointer-events-none">
        {Array.from({ length: 100 }).map((_, idx) => (
          <div key={idx} className="border-[0.5px] border-black/10" />
        ))}
      </div>

      {/* Interactive Vintage Carved Wooden Pawns Layer */}
      {gameState?.players?.map((player, pIdx) => {
        const displayPos = animatedPositions[player.id] !== undefined ? animatedPositions[player.id] : (player.position || 1);
        const coords = getCenterCoords(displayPos);

        // Offset overlapping pawns on the same square
        const samePosPlayers = gameState.players.filter(p => (animatedPositions[p.id] || p.position || 1) === displayPos);
        const offsetIdx = samePosPlayers.findIndex(p => p.id === player.id);
        const offsets = [
          { dx: -2.0, dy: -2.0 },
          { dx: 2.0, dy: -2.0 },
          { dx: -2.0, dy: 2.0 },
          { dx: 2.0, dy: 2.0 },
        ];
        const offset = offsets[offsetIdx % offsets.length] || { dx: 0, dy: 0 };

        const finalX = coords.x + offset.dx;
        const finalY = coords.y + offset.dy;

        const pawnStyle = PAWN_STYLES[pIdx % PAWN_STYLES.length];

        return (
          <div
            key={player.id}
            className="absolute transition-all duration-300 ease-out z-30 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${finalX}%`, top: `${finalY}%` }}
          >
            {/* Vintage Carved Wooden Pawn */}
            <div
              className="relative w-7 h-9 sm:w-9 sm:h-11 flex flex-col items-center justify-end drop-shadow-2xl group transition-transform transform hover:scale-125"
              title={`${player.username} (Square: ${displayPos})`}
            >
              {/* Pawn Head Knob */}
              <div
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-black/40 shadow-inner mb-[-2px] z-10"
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${pawnStyle.border}, ${pawnStyle.main}, ${pawnStyle.dark})`,
                }}
              />
              {/* Pawn Tapered Body */}
              <div
                className="w-4 h-5 sm:w-5 sm:h-6 rounded-t-full border border-black/40 shadow-md flex items-center justify-center"
                style={{
                  background: `linear-gradient(to bottom, ${pawnStyle.main}, ${pawnStyle.dark})`,
                }}
              >
                <span className="text-[8px] sm:text-[9px] font-black text-white/90 drop-shadow font-mono">
                  {pawnStyle.label}
                </span>
              </div>
              {/* Pawn Metallic Base Ring */}
              <div
                className="w-5 h-1.5 sm:w-6 sm:h-2 rounded-full border border-black/60 shadow-lg"
                style={{
                  background: `linear-gradient(to right, #D97706, #FBBF24, #92400E)`,
                }}
              />
            </div>
          </div>
        );
      })}

    </div>
  );
};
