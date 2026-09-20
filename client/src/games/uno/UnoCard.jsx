import React from 'react';

const COLOR_STYLES = {
  red: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white border-red-400 shadow-red-600/30',
  yellow: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 text-slate-900 border-yellow-300 shadow-amber-500/30',
  green: 'bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 text-white border-emerald-400 shadow-emerald-600/30',
  blue: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-blue-400 shadow-blue-600/30',
  wild: 'bg-gradient-to-br from-purple-900 via-slate-900 to-black text-amber-300 border-amber-400 shadow-amber-400/40',
};

const DISPLAY_SYMBOLS = {
  skip: '⊘',
  reverse: '⇄',
  draw2: '+2',
  wild: '🎨',
  draw4: '+4',
};

export default function UnoCard({ card, isPlayable = false, onClick, isFaceDown = false, size = 'normal' }) {
  if (isFaceDown) {
    return (
      <div
        className={`relative rounded-xl border-2 border-slate-700 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 shadow-md flex flex-col items-center justify-center select-none ${
          size === 'small' ? 'w-10 h-14' : size === 'large' ? 'w-24 h-36' : 'w-16 h-24'
        }`}
      >
        <div className="w-4/5 h-4/5 rounded-lg border border-red-500/40 bg-red-950/40 flex items-center justify-center transform -rotate-12">
          <span className="text-red-500 font-black text-xs tracking-wider uppercase">UNO</span>
        </div>
      </div>
    );
  }

  if (!card) return null;

  const colorClass = COLOR_STYLES[card.color] || COLOR_STYLES.wild;
  const symbol = DISPLAY_SYMBOLS[card.value] || card.value;

  const sizeClasses = {
    small: 'w-12 h-18 text-xs',
    normal: 'w-20 h-30 text-base',
    large: 'w-28 h-42 text-xl',
  }[size] || 'w-20 h-30 text-base';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isPlayable && !!onClick}
      className={`relative rounded-xl border-2 shadow-lg flex flex-col justify-between p-1.5 select-none transition-all duration-200 transform ${colorClass} ${sizeClasses} ${
        isPlayable
          ? 'cursor-pointer hover:-translate-y-3 hover:scale-105 hover:shadow-2xl ring-4 ring-white/70 animate-pulse'
          : onClick
          ? 'opacity-70 cursor-not-allowed'
          : ''
      }`}
    >
      {/* Top Left Symbol */}
      <div className="text-left font-black text-xs leading-none tracking-tight pl-0.5 pt-0.5">
        {symbol}
      </div>

      {/* Center Oval */}
      <div className="self-center w-full h-3/5 rounded-full bg-white/90 shadow-inner flex items-center justify-center transform -rotate-12 my-auto">
        <span
          className={`font-black tracking-tighter ${
            card.color === 'yellow' ? 'text-amber-600' : card.color === 'wild' ? 'text-purple-900' : `text-${card.color}-700`
          } ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-3xl' : 'text-xl'}`}
          style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.15)' }}
        >
          {symbol}
        </span>
      </div>

      {/* Bottom Right Symbol */}
      <div className="text-right font-black text-xs leading-none tracking-tight pr-0.5 pb-0.5 transform rotate-180">
        {symbol}
      </div>
    </button>
  );
}
