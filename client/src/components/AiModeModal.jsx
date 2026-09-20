import React, { useState } from 'react';

export default function AiModeModal({ isOpen, onClose, onStart, gameTitle }) {
  const [difficulty, setDifficulty] = useState('Normal');
  const [aiCount, setAiCount] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono animate-fadeIn">
      <div className="term-box w-full max-w-md p-6 text-[var(--text)] relative shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <span className="font-bold text-sm text-[var(--accent)] uppercase">
            [ SYSTEM // PLAY VS AI ]
          </span>
          <button
            onClick={onClose}
            className="hover:text-[var(--accent)] font-bold px-2 py-0.5 border border-transparent hover:border-[var(--border)]"
          >
            [X]
          </button>
        </div>

        <div className="text-xs mb-4 opacity-80">
          CONFIGURING LOCAL BOTS FOR: <span className="text-[var(--accent)] font-bold">{gameTitle.toUpperCase()}</span>
        </div>

        {/* Difficulty Selector */}
        <div className="mb-5">
          <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 opacity-70">
            01 // AI DIFFICULTY LEVEL
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Easy', 'Normal', 'Hard'].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`py-2 text-xs font-bold border transition-all ${
                  difficulty === d
                    ? 'border-[var(--text)] bg-[var(--border)] text-[var(--accent)]'
                    : 'border-[var(--border)] bg-[var(--bg)] opacity-70 hover:opacity-100'
                }`}
              >
                [{d.toUpperCase()}]
              </button>
            ))}
          </div>
        </div>

        {/* AI Count Selector */}
        <div className="mb-6">
          <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 opacity-70">
            02 // COMPUTER OPPONENTS
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(count => (
              <button
                key={count}
                type="button"
                onClick={() => setAiCount(count)}
                className={`py-2 text-xs font-bold border text-center transition-all ${
                  aiCount === count
                    ? 'border-[var(--text)] bg-[var(--border)] text-[var(--accent)]'
                    : 'border-[var(--border)] bg-[var(--bg)] opacity-70 hover:opacity-100'
                }`}
              >
                <div>[{count} BOT{count > 1 ? 'S' : ''}]</div>
                <div className="text-[9px] opacity-60 font-normal">{count + 1} PLAYERS</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 border border-[var(--border)] text-xs font-bold hover:border-[var(--text)]"
          >
            [ CANCEL ]
          </button>
          <button
            type="button"
            onClick={() => onStart({ difficulty, aiCount })}
            className="flex-1 py-2 border border-[var(--text)] bg-[var(--border)] text-[var(--accent)] text-xs font-bold hover:shadow-[0_0_10px_var(--border)]"
          >
            [ LAUNCH GAME ]
          </button>
        </div>

      </div>
    </div>
  );
}
