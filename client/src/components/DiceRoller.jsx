import React, { useState } from 'react';
import { Dices } from 'lucide-react';

export const DiceRoller = ({ value, onRoll, disabled, isMyTurn }) => {
  const [rolling, setRolling] = useState(false);

  const handleRoll = async () => {
    if (disabled || rolling || !isMyTurn) return;
    setRolling(true);
    try {
      await onRoll();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setRolling(false), 600);
    }
  };

  const renderDots = (num) => {
    const dotsMap = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
    };
    const active = dotsMap[num] || [4];

    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-12 h-12 p-2">
        {[...Array(9)].map((_, idx) => (
          <div
            key={idx}
            className={`w-2.5 h-2.5 rounded-full ${
              active.includes(idx) ? 'bg-slate-950 shadow-sm' : 'bg-transparent'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Dice Face Container */}
      <div
        className={`w-20 h-20 bg-gradient-to-br from-amber-100 via-white to-amber-200 rounded-2xl shadow-xl border-4 border-amber-300 flex items-center justify-center transition-all duration-300 transform ${
          rolling ? 'animate-spin scale-110' : ''
        } ${isMyTurn && !disabled ? 'hover:scale-105 cursor-pointer ring-4 ring-purple-500/50' : 'opacity-80'}`}
        onClick={handleRoll}
      >
        {renderDots(value || 1)}
      </div>

      {/* Roll Button */}
      <button
        onClick={handleRoll}
        disabled={disabled || rolling || !isMyTurn}
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-extrabold text-lg shadow-lg transition-all duration-200 ${
          isMyTurn && !disabled && !rolling
            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/40 hover:scale-105 active:scale-95'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
        }`}
      >
        <Dices className={`w-6 h-6 ${rolling ? 'animate-bounce' : ''}`} />
        {rolling ? 'ROLLING...' : isMyTurn ? 'ROLL DICE 🎲' : 'WAIT TURN'}
      </button>
    </div>
  );
};
