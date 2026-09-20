import React, { useState } from 'react';

export default function AiModeModal({ isOpen, onClose, onStart, gameTitle }) {
  const [difficulty, setDifficulty] = useState('Normal');
  const [aiCount, setAiCount] = useState(1); // 1, 2, or 3 AI opponents

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="inline-block p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 text-3xl mb-2">
            🤖
          </div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Play vs AI — {gameTitle}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Customize your offline match with computer opponents
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            AI Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Easy', label: 'Easy', emoji: '🌱', color: 'hover:border-emerald-500' },
              { id: 'Normal', label: 'Normal', emoji: '⚡', color: 'hover:border-blue-500' },
              { id: 'Hard', label: 'Hard', emoji: '🔥', color: 'hover:border-rose-500' },
            ].map(diff => (
              <button
                key={diff.id}
                type="button"
                onClick={() => setDifficulty(diff.id)}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  difficulty === diff.id
                    ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-lg shadow-indigo-600/30'
                    : `bg-slate-800/80 border-slate-700 text-slate-300 ${diff.color}`
                }`}
              >
                <span className="text-lg mb-1">{diff.emoji}</span>
                <span className="text-xs font-semibold">{diff.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Number of AI Opponents */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Number of AI Opponents
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { count: 1, label: '1 AI (2 Players)' },
              { count: 2, label: '2 AI (3 Players)' },
              { count: 3, label: '3 AI (4 Players)' },
            ].map(item => (
              <button
                key={item.count}
                type="button"
                onClick={() => setAiCount(item.count)}
                className={`py-3 px-2 rounded-xl border text-center transition-all ${
                  aiCount === item.count
                    ? 'bg-purple-600 border-purple-400 text-white font-bold shadow-lg shadow-purple-600/30'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="text-lg font-black">{item.count} Bot{item.count > 1 ? 's' : ''}</div>
                <div className="text-[10px] text-slate-400 font-normal">{item.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onStart({ difficulty, aiCount })}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            🎮 Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
