import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Users, Dices, Trophy, ArrowRight, ShieldCheck, HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: 'How do I invite friends to play?',
      a: 'Create a room for Snake & Ladder or Ludo. You will receive a unique 5-character Room Code (e.g. AB7KQ) and a direct invite link to share with your friends.',
    },
    {
      q: 'Do my friends need to install anything?',
      a: 'No! GameRoom works directly in any web browser on Desktop, Laptop, Tablet, or Mobile phone without downloading any app.',
    },
    {
      q: 'Is dice rolling fair and secure?',
      a: 'Yes! All game logic and dice rolls are generated strictly by our server engine (Server Authoritative) to ensure complete fairness and prevent any cheating.',
    },
    {
      q: 'What happens if I briefly lose internet connection?',
      a: 'GameRoom includes automatic reconnection support. If you disconnect temporarily, simply reopen the link and you will resume right where you left off!',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Banner */}
      <section className="relative pt-12 pb-8 overflow-hidden text-center max-w-5xl mx-auto px-4">
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-widest mb-6 shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400" /> Real-Time Online Multiplayer
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-4">
          GAME <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">ROOM</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium mb-8 leading-relaxed">
          "Play with your friends, wherever they are."
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
          <h2 className="text-3xl font-black text-white tracking-tight">Featured Multiplayer Games</h2>
          <p className="text-slate-400 text-sm mt-1">Select a game to start playing with your friends instantly</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Snake & Ladder */}
          <div className="group relative bg-slate-900 border border-slate-800 hover:border-purple-500/60 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all" />
            
            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-3xl shadow-lg mb-6 group-hover:rotate-6 transition-transform">
                🎲
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-extrabold text-white">Snake & Ladder</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  2–4 Players
                </span>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Classic 10x10 board game. Roll dice, climb ladders upward, avoid snake bites, and be the first to reach square 100!
              </p>
            </div>

            <Link
              to="/create-room?game=SNAKE_LADDER"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-base shadow-lg shadow-purple-600/30 transition-colors"
            >
              PLAY NOW <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Card 2: Ludo */}
          <div className="group relative bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all" />

            <div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-3xl shadow-lg mb-6 group-hover:-rotate-6 transition-transform">
                🟢
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-extrabold text-white">Ludo Online</h3>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  2–4 Players
                </span>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Strategic multiplayer board game. Race 4 tokens around the board, capture opponent tokens, and guide all tokens home!
              </p>
            </div>

            <Link
              to="/create-room?game=LUDO"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base shadow-lg shadow-blue-600/30 transition-colors"
            >
              PLAY NOW <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </section>

      {/* How To Play Accordion */}
      <section className="max-w-4xl mx-auto px-4 pt-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-7 h-7 text-purple-400" />
            <h3 className="text-2xl font-black text-white">How To Play Online</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left font-bold text-slate-200 flex items-center justify-between hover:text-purple-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
