import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Users, ArrowRight, Sparkles, Bot, Globe } from 'lucide-react';
import AiModeModal from '../components/AiModeModal';

export const HomePage = () => {
  const navigate = useNavigate();
  const [selectedAiGame, setSelectedAiGame] = useState(null); // { id: 'snake-ladder'|'ludo'|'uno', title: string }

  const handleStartAiGame = ({ difficulty, aiCount }) => {
    if (!selectedAiGame) return;
    const gamePath = selectedAiGame.id;
    setSelectedAiGame(null);
    navigate(`/${gamePath}/ai?difficulty=${difficulty}&aiCount=${aiCount}`);
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Banner */}
      <section className="relative pt-12 pb-8 overflow-hidden text-center max-w-5xl mx-auto px-4">
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400" /> Real-Time Multiplayer & AI Single Player
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-4">
          GAME <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">ROOM</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium mb-8 leading-relaxed">
          "Play online with real friends or offline against smart computer AI."
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/create-room"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-lg shadow-xl shadow-purple-600/30 hover:scale-105 transition-all"
          >
            <Gamepad2 className="w-6 h-6" /> Create Room
          </Link>
          <Link
            to="/join"
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-lg border border-slate-700 shadow-xl hover:scale-105 transition-all"
          >
            <Users className="w-6 h-6 text-cyan-400" /> Join Room
          </Link>
        </div>
      </section>

      {/* Game Cards Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white tracking-tight">Featured Games</h2>
          <p className="text-slate-400 text-sm mt-1">Play online with friends or challenge smart computer opponents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Snake & Ladder */}
          <div className="group relative bg-slate-900 border border-slate-800 hover:border-emerald-500/60 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-600/20 transition-all" />
            
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl shadow-lg mb-4 group-hover:rotate-6 transition-transform">
                🎲
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-extrabold text-white">Snake & Ladder</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  2–4 Players
                </span>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Classic 10x10 board game. Roll dice, climb ladders upward, avoid snakes, and reach square 100!
              </p>
            </div>

            <div className="space-y-2">
              <Link
                to="/create-room?game=SNAKE_LADDER"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-colors"
              >
                <Globe className="w-4 h-4" /> Play Online
              </Link>
              <button
                type="button"
                onClick={() => setSelectedAiGame({ id: 'snake-ladder', title: 'Snake & Ladder' })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors"
              >
                <Bot className="w-4 h-4" /> Play vs AI
              </button>
            </div>
          </div>

          {/* Card 2: Ludo */}
          <div className="group relative bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-3xl shadow-lg mb-4 group-hover:-rotate-6 transition-transform">
                🟢
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-extrabold text-white">Ludo Classic</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  2–4 Players
                </span>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Strategic board game. Race 4 tokens, capture opponents, and guide all tokens home!
              </p>
            </div>

            <div className="space-y-2">
              <Link
                to="/create-room?game=LUDO"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-colors"
              >
                <Globe className="w-4 h-4" /> Play Online
              </Link>
              <button
                type="button"
                onClick={() => setSelectedAiGame({ id: 'ludo', title: 'Ludo Classic' })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors"
              >
                <Bot className="w-4 h-4" /> Play vs AI
              </button>
            </div>
          </div>

          {/* Card 3: UNO */}
          <div className="group relative bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl group-hover:bg-amber-600/20 transition-all" />

            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                🃏
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-extrabold text-white">UNO Card Game</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  2–4 Players
                </span>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Classic card game! Match colors, play Skip, Reverse & Draw cards, call UNO, and be first to empty your hand!
              </p>
            </div>

            <div className="space-y-2">
              <Link
                to="/create-room?game=UNO"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-colors"
              >
                <Globe className="w-4 h-4" /> Play Online
              </Link>
              <button
                type="button"
                onClick={() => setSelectedAiGame({ id: 'uno', title: 'UNO Card Game' })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs uppercase tracking-wider border border-slate-700 transition-colors"
              >
                <Bot className="w-4 h-4" /> Play vs AI
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* AI Mode Selector Modal */}
      <AiModeModal
        isOpen={!!selectedAiGame}
        onClose={() => setSelectedAiGame(null)}
        onStart={handleStartAiGame}
        gameTitle={selectedAiGame?.title || ''}
      />

    </div>
  );
};
