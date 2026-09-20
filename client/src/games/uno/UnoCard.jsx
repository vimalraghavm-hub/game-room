import React from 'react';

const LIGHT_COLOR_CLASSES = {
  red: 'bg-red-600 text-white border-red-400 shadow-red-600/40',
  yellow: 'bg-amber-400 text-slate-950 border-yellow-200 shadow-amber-400/40',
  green: 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/40',
  blue: 'bg-blue-600 text-white border-blue-400 shadow-blue-600/40',
  wild: 'bg-gradient-to-br from-slate-900 via-purple-900 to-black text-amber-300 border-amber-400 shadow-amber-400/50',
};

const DARK_COLOR_CLASSES = {
  pink: 'bg-pink-600 text-white border-pink-300 shadow-pink-600/40',
  teal: 'bg-teal-600 text-white border-teal-300 shadow-teal-600/40',
  orange: 'bg-orange-500 text-slate-950 border-orange-200 shadow-orange-500/40',
  purple: 'bg-purple-700 text-white border-purple-400 shadow-purple-600/40',
  wild: 'bg-gradient-to-br from-black via-slate-950 to-purple-950 text-pink-300 border-pink-400 shadow-pink-400/50',
};

const DISPLAY_SYMBOLS = {
  skip: '⊘',
  skip_all: '⊘⊘',
  reverse: '⇄',
  draw1: '+1',
  draw2: '+2',
  draw4: '+4',
  draw5: '+5',
  flip: '🔄 FLIP',
  wild: '🎨',
  draw_color: '🎨 +COLOR',
};

export default function UnoCard({
  card,
  activeSide = 'light',
  isPlayable = false,
  onClick,
  isFaceDown = false,
  size = 'normal',
  isFlipping = false
}) {
  if (isFaceDown) {
    const isDark = activeSide === 'dark';
    return (
      <div
        className={`relative rounded-lg border-2 shadow-md flex flex-col items-center justify-center select-none font-mono transition-transform duration-700 ${
          isDark ? 'border-purple-500 bg-slate-950' : 'border-slate-700 bg-slate-900'
        } ${size === 'small' ? 'w-10 h-14' : size === 'large' ? 'w-24 h-36' : 'w-16 h-24'} ${isFlipping ? 'animate-pulse scale-95' : ''}`}
      >
        <div className={`w-4/5 h-4/5 rounded border flex items-center justify-center transform -rotate-12 ${
          isDark ? 'border-pink-500/50 bg-purple-950/60' : 'border-red-500/50 bg-red-950/60'
        }`}>
          <span className={`font-black text-[10px] tracking-wider uppercase ${isDark ? 'text-pink-400' : 'text-red-400'}`}>
            {isDark ? 'FLIP' : 'UNO'}
          </span>
        </div>
      </div>
    );
  }

  if (!card) return null;

  const cardFace = card.activeFace || (activeSide === 'dark' ? (card.darkSide || card.lightSide || card) : (card.lightSide || card));
  const color = cardFace.color || 'wild';
  const symbol = DISPLAY_SYMBOLS[cardFace.value] || cardFace.value;

  const colorClass = activeSide === 'dark'
    ? (DARK_COLOR_CLASSES[color] || DARK_COLOR_CLASSES.wild)
    : (LIGHT_COLOR_CLASSES[color] || LIGHT_COLOR_CLASSES.wild);

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
      className={`relative rounded-lg border-2 shadow-xl flex flex-col justify-between p-1.5 select-none font-mono transition-all duration-300 transform ${colorClass} ${sizeClasses} ${
        isFlipping ? 'scale-95 rotate-6 shadow-2xl' : ''
      } ${
        isPlayable
          ? 'cursor-pointer hover:-translate-y-3 hover:scale-105 ring-4 ring-white/80 animate-pulse z-20'
          : onClick
          ? 'opacity-70 cursor-not-allowed'
          : ''
      }`}
    >
      {/* Top Left Symbol */}
      <div className="text-left font-black text-[11px] leading-none tracking-tight pl-0.5 pt-0.5">
        {symbol}
      </div>

      {/* Center White Oval */}
      <div className="self-center w-full h-3/5 rounded-md bg-white/95 shadow-inner flex items-center justify-center transform -rotate-6 my-auto">
        <span
          className={`font-black tracking-tighter ${
            color === 'yellow' || color === 'orange' ? 'text-slate-950' : 'text-slate-900'
          } ${size === 'small' ? 'text-xs' : size === 'large' ? 'text-2xl' : 'text-base'}`}
        >
          {symbol}
        </span>
      </div>

      {/* Bottom Right Symbol */}
      <div className="text-right font-black text-[11px] leading-none tracking-tight pr-0.5 pb-0.5 transform rotate-180">
        {symbol}
      </div>
    </button>
  );
}
