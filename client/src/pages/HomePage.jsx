import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AiModeModal from '../components/AiModeModal';

export const HomePage = () => {
  const navigate = useNavigate();
  const [selectedAiGame, setSelectedAiGame] = useState(null); // { id, title, mode }

  const handleStartAiGame = ({ difficulty, aiCount }) => {
    if (!selectedAiGame) return;
    const gamePath = selectedAiGame.id;
    const modeParam = selectedAiGame.mode ? `&mode=${selectedAiGame.mode}` : '';
    setSelectedAiGame(null);
    navigate(`/${gamePath}/ai?difficulty=${difficulty}&aiCount=${aiCount}${modeParam}`);
  };

  const games = [
    {
      code: '01',
      id: 'snake-ladder',
      title: 'SNAKE & LADDER',
      desc: '100-tile climb. Roll dice, climb ladders, avoid snakes.',
      gameType: 'SNAKE_LADDER',
      mode: null,
      tag: '2-4 PLAYERS',
    },
    {
      code: '02',
      id: 'ludo',
      title: 'LUDO CLASSIC',
      desc: 'Strategic 4-token race & capture around the board.',
      gameType: 'LUDO',
      mode: null,
      tag: '2-4 PLAYERS',
    },
    {
      code: '03',
      id: 'uno',
      title: 'CLASSIC UNO',
      desc: 'Match colors, play Skip, Reverse & Draw cards.',
      gameType: 'UNO',
      mode: 'CLASSIC',
      tag: 'CARD GAME',
    },
    {
      code: '04',
      id: 'uno',
      title: 'UNO FLIP!',
      desc: '2-sided card battle with Light & Dark side flip mechanics.',
      gameType: 'UNO_FLIP',
      mode: 'FLIP',
      tag: 'DUAL SIDED',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 font-mono text-[var(--text)]">
      
      {/* Header Banner / System Dossier */}
      <div className="term-box p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 text-xs">
          <span className="font-bold text-[var(--accent)]">[ SYSTEM // TERMINAL DASHBOARD ]</span>
          <span className="opacity-70">NODE: ONLINE // PORT: 10000</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--accent)]">
          GAMEROOM // MULTIPLAYER OS
        </h1>

        <p className="text-xs sm:text-sm opacity-80 max-w-3xl leading-relaxed">
          AUTHORITATIVE MULTIPLAYER ENGINE. PLAY ONLINE ROOMS WITH FRIENDS OR LAUNCH OFFLINE COMPUTE BOTS.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            to="/create-room"
            className="term-button px-5 py-2 text-xs uppercase"
          >
            [ + CREATE ROOM ]
          </Link>
          <Link
            to="/join"
            className="term-button px-5 py-2 text-xs uppercase"
          >
            [ &gt; JOIN ROOM ]
          </Link>
        </div>
      </div>

      {/* Game Selection Grid */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-2 text-xs">
          <span className="font-bold text-[var(--accent)]">[ AVAILABLE GAME MODULES ]</span>
          <span className="opacity-60">04 MODULES LOADED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {games.map(game => (
            <div
              key={game.code}
              className="term-box p-4 flex flex-col justify-between hover:border-[var(--text)] transition-colors"
            >
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-[10px] opacity-70">
                  <span>MODULE_{game.code}</span>
                  <span className="border border-[var(--border)] px-1.5 py-0.5">{game.tag}</span>
                </div>
                <h3 className="text-base font-black text-[var(--accent)]">{game.title}</h3>
                <p className="text-xs opacity-75 leading-tight">{game.desc}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                <Link
                  to={`/create-room?game=${game.gameType}`}
                  className="term-button w-full py-1.5 text-center text-xs block"
                >
                  [ PLAY ONLINE ]
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedAiGame({ id: game.id, title: game.title, mode: game.mode })}
                  className="term-button w-full py-1.5 text-center text-xs opacity-80 hover:opacity-100"
                >
                  [ PLAY VS AI ]
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Terminal System Status Info */}
      <div className="term-box p-6 space-y-3 text-xs">
        <div className="font-bold text-[var(--accent)] border-b border-[var(--border)] pb-2">
          [ SYSTEM DIAGNOSTICS & HARDWARE SPECIFICATIONS ]
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-80 text-[11px]">
          <div>
            <div className="font-bold text-[var(--accent)]">SERVER ARCHITECTURE:</div>
            <div>Authoritative Socket.IO engine validating move legality, turn order, deck integrity.</div>
          </div>
          <div>
            <div className="font-bold text-[var(--accent)]">THEME ENGINE:</div>
            <div>4 persistent phosphor profiles (CRT, Purple, Amber, Clean Mono) with scanline toggle.</div>
          </div>
          <div>
            <div className="font-bold text-[var(--accent)]">DUAL-SIDE UNO FLIP:</div>
            <div>Full 2-sided card battle implementation with 3D table flip transformations.</div>
          </div>
        </div>
      </div>

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
