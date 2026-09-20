import React, { useState, useEffect } from 'react';
import UnoCard from './UnoCard';

const LIGHT_COLORS = ['red', 'yellow', 'green', 'blue'];
const DARK_COLORS = ['pink', 'teal', 'orange', 'purple'];

export default function UnoBoard({ gameState, myPlayerId, onPlayCard, onDrawCard, onCallUno }) {
  const [selectedWildCard, setSelectedWildCard] = useState(null);
  const [remainingTimer, setRemainingTimer] = useState(30);
  const [isFlippingTable, setIsFlippingTable] = useState(false);

  // Trigger 3D table flip animation when activeSide changes
  useEffect(() => {
    if (gameState?.activeSide) {
      setIsFlippingTable(true);
      const timer = setTimeout(() => setIsFlippingTable(false), 900);
      return () => clearTimeout(timer);
    }
  }, [gameState?.activeSide]);

  // Server Turn Timer Countdown Effect
  useEffect(() => {
    if (!gameState || gameState.status !== 'PLAYING') return;

    const duration = gameState.turnTimerDuration || 30;
    const startTime = gameState.turnStartTime || Date.now();

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const left = Math.max(0, duration - elapsed);
      setRemainingTimer(left);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [gameState?.turnStartTime, gameState?.turnTimerDuration, gameState?.status, gameState?.currentTurnPlayerId]);

  if (!gameState) {
    return (
      <div className="term-box p-8 text-center text-xs font-mono text-[var(--text)]">
        // SYNCHRONIZING UNO GAME TABLE...
      </div>
    );
  }

  const {
    mode = 'CLASSIC',
    activeSide = 'light',
    currentTurnPlayerId,
    direction,
    currentColor,
    topDiscardCard,
    drawPileCount,
    lastAction,
    status,
    winner,
    turnTimerDuration = 30,
    players = []
  } = gameState;

  const myPlayer = players.find(p => p.id === myPlayerId) || players[0] || {};
  const isMyTurn = currentTurnPlayerId === myPlayer.id;
  const opponents = players.filter(p => p.id !== myPlayer.id);

  const canPlay = (card) => {
    if (!isMyTurn || status !== 'PLAYING') return false;
    const face = card.activeFace || (activeSide === 'dark' ? (card.darkSide || card.lightSide || card) : (card.lightSide || card));
    if (!face) return false;
    if (face.color === 'wild' || face.type === 'wild' || face.type === 'draw2' || face.type === 'draw4' || face.type === 'draw_color') return true;
    const topFace = topDiscardCard ? (topDiscardCard.activeFace || (activeSide === 'dark' ? (topDiscardCard.darkSide || topDiscardCard.lightSide || topDiscardCard) : (topDiscardCard.lightSide || topDiscardCard))) : null;
    return face.color === currentColor || (topFace && face.value === topFace.value);
  };

  const handleCardClick = (card) => {
    if (!canPlay(card)) return;
    const face = card.activeFace || (activeSide === 'dark' ? (card.darkSide || card.lightSide || card) : (card.lightSide || card));
    if (face.color === 'wild' || face.type === 'wild' || face.type === 'draw2' || face.type === 'draw4' || face.type === 'draw_color') {
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

  // Timer Bar Color Calculation
  const timerPercent = Math.min(100, Math.max(0, (remainingTimer / turnTimerDuration) * 100));
  const timerBarColor = remainingTimer <= 5 ? 'bg-red-500' : remainingTimer <= 10 ? 'bg-amber-500' : 'bg-emerald-500';

  const availableColors = activeSide === 'dark' ? DARK_COLORS : LIGHT_COLORS;

  return (
    <div className={`term-box w-full max-w-5xl mx-auto flex flex-col justify-between min-h-[680px] p-4 font-mono text-[var(--text)] relative overflow-hidden transition-all duration-700 ${
      isFlippingTable ? 'rotate-1 scale-98 shadow-2xl' : ''
    }`}>

      {/* TOP HEADER BAR: MODE, TIMER BAR & DIRECTION */}
      <div className="flex flex-col gap-2 pb-3 border-b border-[var(--border)] z-10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--accent)]">
              [ MODE: {mode === 'FLIP' ? '🔄 UNO FLIP' : '🃏 CLASSIC UNO'} ]
            </span>
            {mode === 'FLIP' && (
              <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                activeSide === 'dark' ? 'bg-purple-950 border-purple-500 text-pink-400' : 'bg-emerald-950 border-emerald-500 text-emerald-300'
              }`}>
                SIDE: {activeSide.toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span>TURN TIMER: {remainingTimer}s</span>
            <span>{direction === 1 ? '↻ CLOCKWISE' : '↺ COUNTER-CLOCKWISE'}</span>
          </div>
        </div>

        {/* Server Turn Timer Bar */}
        <div className="w-full h-1.5 bg-slate-900 border border-[var(--border)] overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${timerBarColor}`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* OPPONENTS BAR */}
      <div className="flex justify-around items-center gap-4 py-3 z-10">
        {opponents.map(opp => {
          const isOppTurn = currentTurnPlayerId === opp.id;
          return (
            <div
              key={opp.id}
              className={`p-2.5 border text-center transition-all ${
                isOppTurn
                  ? 'border-[var(--text)] bg-[var(--border)] text-[var(--accent)] font-bold shadow-lg scale-105'
                  : 'border-[var(--border)] bg-[var(--panel-bg)] opacity-80'
              }`}
            >
              <div className="text-xs font-bold mb-1 flex items-center justify-center gap-1">
                <span>{opp.avatar || '👤'}</span>
                <span>{opp.name}</span>
                {opp.hasCalledUno && (
                  <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black animate-bounce">
                    UNO!
                  </span>
                )}
              </div>
              <div className="text-[10px] opacity-70 mb-1">{opp.cardCount} CARDS</div>

              <div className="flex -space-x-3 justify-center overflow-hidden py-0.5">
                {Array.from({ length: Math.min(opp.cardCount, 6) }).map((_, idx) => (
                  <UnoCard key={idx} isFaceDown activeSide={activeSide} size="small" isFlipping={isFlippingTable} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CENTER GAME TABLE (DECKS & DISCARD PILE) */}
      <div className="my-4 flex flex-col items-center justify-center z-10">
        <div className="flex items-center gap-2 mb-3 bg-[var(--bg)] px-3 py-1 border border-[var(--border)] text-xs font-bold">
          <span>ACTIVE COLOR:</span>
          <span className="uppercase font-black text-[var(--accent)]">{currentColor || 'WILD'}</span>
        </div>

        <div className="flex items-center gap-8">
          {/* Draw Pile */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={onDrawCard}
              disabled={!isMyTurn || status !== 'PLAYING'}
              className={`transition-transform ${isMyTurn ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
            >
              <UnoCard isFaceDown activeSide={activeSide} size="large" isFlipping={isFlippingTable} />
            </button>
            <span className="text-[10px] font-bold mt-1 opacity-70">DRAW PILE ({drawPileCount})</span>
          </div>

          {/* Top Discard Card */}
          <div className="flex flex-col items-center">
            <div className={`p-1 border-2 transition-all ${isFlippingTable ? 'rotate-180 scale-105' : ''}`}>
              <UnoCard card={topDiscardCard} activeSide={activeSide} size="large" isFlipping={isFlippingTable} />
            </div>
            <span className="text-[10px] font-bold mt-1 opacity-70">DISCARD PILE</span>
          </div>
        </div>

        {/* Action Feed */}
        {lastAction && (
          <div className="mt-4 px-3 py-1 border border-[var(--border)] bg-[var(--bg)] text-xs font-medium text-[var(--accent)]">
            &gt; {lastAction}
          </div>
        )}
      </div>

      {/* BOTTOM HUMAN PLAYER HAND & CONTROLS */}
      <div className="z-10 border border-[var(--border)] bg-[var(--panel-bg)] p-3">
        <div className="flex items-center justify-between mb-2 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <span>{myPlayer.avatar || '👤'}</span>
            <span>{myPlayer.name} (YOU)</span>
            {isMyTurn && (
              <span className="px-2 py-0.5 bg-[var(--border)] text-[var(--accent)] border border-[var(--text)] font-black text-[10px] animate-pulse">
                [ YOUR TURN ]
              </span>
            )}
          </div>

          {myPlayer.hand && myPlayer.hand.length === 1 && !myPlayer.hasCalledUno && (
            <button
              type="button"
              onClick={onCallUno}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider animate-bounce shadow-lg"
            >
              🔥 CALL UNO!
            </button>
          )}
        </div>

        {/* Hand Cards Scroll Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-3 px-1">
          {myPlayer.hand && myPlayer.hand.length > 0 ? (
            myPlayer.hand.map(card => (
              <UnoCard
                key={card.id}
                card={card}
                activeSide={activeSide}
                isPlayable={canPlay(card)}
                onClick={() => handleCardClick(card)}
                size="normal"
                isFlipping={isFlippingTable}
              />
            ))
          ) : (
            <div className="text-xs opacity-50 py-4 w-full text-center">// NO CARDS REMAINING</div>
          )}
        </div>
      </div>

      {/* WILD COLOR PICKER MODAL */}
      {selectedWildCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono">
          <div className="term-box p-6 text-center max-w-xs w-full shadow-2xl">
            <h3 className="text-sm font-bold text-[var(--accent)] mb-1">[ SELECT WILD COLOR ]</h3>
            <p className="text-[10px] opacity-70 mb-4">CHOOSE COLOR FOR {activeSide.toUpperCase()} SIDE</p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {availableColors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleColorPick(c)}
                  className="py-3 font-black text-xs uppercase border border-[var(--border)] hover:border-[var(--text)] transition-transform hover:scale-105"
                  style={{
                    backgroundColor: c === 'red' ? '#DC2626' : c === 'yellow' ? '#D97706' : c === 'green' ? '#059669' : c === 'blue' ? '#2563EB' : c === 'pink' ? '#DB2777' : c === 'teal' ? '#0D9488' : c === 'orange' ? '#EA580C' : '#7C3AED',
                    color: c === 'yellow' || c === 'orange' ? '#000' : '#fff'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSelectedWildCard(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              [ CANCEL ]
            </button>
          </div>
        </div>
      )}

      {/* VICTORY OVERLAY */}
      {status === 'FINISHED' && winner && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4 font-mono">
          <div className="term-box p-6 text-center max-w-md w-full shadow-2xl">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-xl font-black text-[var(--accent)]">
              {winner.name.toUpperCase()} WINS THE MATCH!
            </h2>
            <p className="text-xs opacity-70 mt-1 mb-6">// GAME FINISHED</p>

            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="term-button w-full py-2.5 text-xs font-bold"
            >
              [ RETURN TO HOME ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
