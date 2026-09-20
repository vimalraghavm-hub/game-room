import React, { useState } from 'react';
import UnoCard from './UnoCard';

const COLOR_GLOW = {
  red: 'shadow-[0_0_50px_rgba(239,68,68,0.6)] border-red-500',
  yellow: 'shadow-[0_0_50px_rgba(245,158,11,0.6)] border-amber-400',
  green: 'shadow-[0_0_50px_rgba(16,185,129,0.6)] border-emerald-500',
  blue: 'shadow-[0_0_50px_rgba(59,130,246,0.6)] border-blue-500',
  wild: 'shadow-[0_0_50px_rgba(168,85,247,0.6)] border-purple-500',
};

export default function UnoBoard({ gameState, myPlayerId, onPlayCard, onDrawCard, onCallUno }) {
  const [selectedWildCard, setSelectedWildCard] = useState(null);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-medium">
        Loading UNO Game Table...
      </div>
    );
  }

  const {
    currentTurnPlayerId,
    direction,
    currentColor,
    topDiscardCard,
    drawPileCount,
    lastAction,
    status,
    winner,
    players = []
  } = gameState;

  const myPlayer = players.find(p => p.id === myPlayerId) || players[0] || {};
  const isMyTurn = currentTurnPlayerId === myPlayer.id;
  const opponents = players.filter(p => p.id !== myPlayer.id);

  // Check card playability for human player
  const canPlay = (card) => {
    if (!isMyTurn || status !== 'PLAYING') return false;
    if (card.color === 'wild' || card.type === 'wild' || card.type === 'draw4') return true;
    return card.color === currentColor || (topDiscardCard && card.value === topDiscardCard.value);
  };

  const handleCardClick = (card) => {
    if (!canPlay(card)) return;

    if (card.color === 'wild' || card.type === 'wild' || card.type === 'draw4') {
      // Show color picker modal
      setSelectedWildCard(card);
    } else {
      onPlayCard(card.id, null);
    }
  };

  const handleColorPick = (color) => {
    if (selectedWildCard) {
      onPlayCard(selectedWildCard.id, color);
      setSelectedWildCard(null);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto flex flex-col justify-between min-h-[680px] p-4 bg-slate-950/90 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden text-white">
      
      {/* Background Direction Arrows */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-9xl font-black">
        {direction === 1 ? '↻' : '↺'}
      </div>

      {/* TOP: OPPONENTS BAR */}
      <div className="flex justify-around items-center gap-4 py-2 z-10">
        {opponents.map((opp) => {
          const isOppTurn = currentTurnPlayerId === opp.id;
          return (
            <div
              key={opp.id}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                isOppTurn
                  ? 'bg-indigo-900/40 border-indigo-400 ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/20 scale-105 animate-pulse'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{opp.avatar || '👤'}</span>
                <div>
                  <div className="font-bold text-sm leading-none">{opp.name}</div>
                  <div className="text-[10px] text-slate-400">
                    {opp.cardCount} card{opp.cardCount !== 1 ? 's' : ''}
                  </div>
                </div>
                {opp.hasCalledUno && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-bounce">
                    UNO!
                  </span>
                )}
              </div>

              {/* Fan of face-down cards */}
              <div className="flex -space-x-4 overflow-hidden py-1">
                {Array.from({ length: Math.min(opp.cardCount, 7) }).map((_, idx) => (
                  <UnoCard key={idx} isFaceDown size="small" />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CENTER: GAME TABLE (DRAW DECK & DISCARD PILE) */}
      <div className="my-6 flex flex-col items-center justify-center relative z-10">
        {/* Active Color Badge & Direction Indicator */}
        <div className="flex items-center gap-3 mb-4 bg-slate-900/80 px-4 py-2 rounded-full border border-slate-700 shadow-md">
          <span className="text-xs uppercase font-bold text-slate-400">Active Color:</span>
          <div className="flex items-center gap-1.5 font-black uppercase text-sm">
            <span
              className={`w-4 h-4 rounded-full border-2 border-white/50 ${
                currentColor === 'red'
                  ? 'bg-red-500 shadow-red-500/50'
                  : currentColor === 'yellow'
                  ? 'bg-amber-400 shadow-amber-400/50'
                  : currentColor === 'green'
                  ? 'bg-emerald-500 shadow-emerald-500/50'
                  : currentColor === 'blue'
                  ? 'bg-blue-500 shadow-blue-500/50'
                  : 'bg-purple-500'
              }`}
            />
            <span
              className={
                currentColor === 'red'
                  ? 'text-red-400'
                  : currentColor === 'yellow'
                  ? 'text-amber-300'
                  : currentColor === 'green'
                  ? 'text-emerald-400'
                  : currentColor === 'blue'
                  ? 'text-blue-400'
                  : 'text-purple-400'
              }
            >
              {currentColor || 'Wild'}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
            {direction === 1 ? '↻ Clockwise' : '↺ Counter-Clockwise'}
          </span>
        </div>

        {/* Card Decks */}
        <div className="flex items-center justify-center gap-8">
          {/* Draw Deck */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={onDrawCard}
              disabled={!isMyTurn || status !== 'PLAYING'}
              className={`relative transform transition-all ${
                isMyTurn ? 'cursor-pointer hover:scale-105 active:scale-95' : 'opacity-70 cursor-not-allowed'
              }`}
            >
              <UnoCard isFaceDown size="large" />
              <div className="absolute -bottom-2 bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-300 shadow">
                Draw ({drawPileCount})
              </div>
            </button>
          </div>

          {/* Top Discard Card */}
          <div className="flex flex-col items-center">
            <div className={`p-2 rounded-2xl border-2 transition-all duration-300 ${COLOR_GLOW[currentColor] || COLOR_GLOW.wild}`}>
              <UnoCard card={topDiscardCard} size="large" />
            </div>
            <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Discard Pile
            </div>
          </div>
        </div>

        {/* Last Action Banner */}
        {lastAction && (
          <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-indigo-300 font-medium shadow">
            {lastAction}
          </div>
        )}
      </div>

      {/* BOTTOM: HUMAN PLAYER'S HAND & CONTROLS */}
      <div className="z-10 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{myPlayer.avatar || '👤'}</span>
            <span className="font-bold text-sm">{myPlayer.name} (You)</span>
            {isMyTurn && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold animate-pulse">
                YOUR TURN
              </span>
            )}
          </div>

          {/* UNO Call Button */}
          {myPlayer.hand && myPlayer.hand.length === 1 && !myPlayer.hasCalledUno && (
            <button
              type="button"
              onClick={onCallUno}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 animate-bounce transition-transform transform active:scale-95"
            >
              🔥 CALL UNO!
            </button>
          )}
        </div>

        {/* Cards Carousel / Scroll Container */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-4 px-2 scrollbar-thin scrollbar-thumb-slate-700">
          {myPlayer.hand && myPlayer.hand.length > 0 ? (
            myPlayer.hand.map((card) => (
              <UnoCard
                key={card.id}
                card={card}
                isPlayable={canPlay(card)}
                onClick={() => handleCardClick(card)}
                size="normal"
              />
            ))
          ) : (
            <div className="text-xs text-slate-500 py-4 w-full text-center">No cards in hand</div>
          )}
        </div>
      </div>

      {/* WILD COLOR PICKER MODAL */}
      {selectedWildCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black text-white mb-1">Choose Wild Color</h3>
            <p className="text-xs text-slate-400 mb-6">Select the new active color for the table</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { id: 'red', name: 'RED', color: 'bg-red-600 hover:bg-red-500 border-red-400' },
                { id: 'yellow', name: 'YELLOW', color: 'bg-yellow-500 hover:bg-yellow-400 border-yellow-300 text-slate-900' },
                { id: 'green', name: 'GREEN', color: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400' },
                { id: 'blue', name: 'BLUE', color: 'bg-blue-600 hover:bg-blue-500 border-blue-400' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleColorPick(c.id)}
                  className={`py-5 rounded-2xl border-2 font-black text-lg tracking-wider shadow-lg transition-transform transform hover:scale-105 active:scale-95 ${c.color}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedWildCard(null)}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* VICTORY OVERLAY */}
      {status === 'FINISHED' && winner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl p-8 text-center max-w-md w-full shadow-2xl">
            <div className="text-6xl mb-3 animate-bounce">🏆</div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
              {winner.name} WINS!
            </h2>
            <p className="text-sm text-slate-400 mt-2 mb-6">
              The UNO match has ended!
            </p>

            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
