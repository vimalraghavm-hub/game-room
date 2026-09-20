import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

export const CreateRoomPage = () => {
  const [searchParams] = useSearchParams();
  const initialGame = searchParams.get('game') || 'SNAKE_LADDER';

  const { createRoom } = useSocket();
  const navigate = useNavigate();

  const [gameType, setGameType] = useState(initialGame);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [startingHandSize, setStartingHandSize] = useState(7);
  const [turnTimerDuration, setTurnTimerDuration] = useState(30);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await createRoom(gameType, {
        isPrivate,
        password,
        maxPlayers: Number(maxPlayers),
        startingHandSize: Number(startingHandSize),
        turnTimerDuration: Number(turnTimerDuration),
      });

      if (res?.roomCode) {
        navigate(`/room/${res.roomCode}`);
      } else {
        setError('Room creation failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Unable to create room. Please check connection.');
      setLoading(false);
    }
  };

  const isUnoGame = gameType === 'UNO' || gameType === 'UNO_FLIP';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 font-mono text-[var(--text)]">
      <div className="term-box p-6 space-y-6">
        
        {/* Header */}
        <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
          <span className="font-bold text-sm text-[var(--accent)]">[ CONFIGURATION // CREATE ROOM ]</span>
          <span className="text-xs opacity-70">SYSTEM READY</span>
        </div>

        {error && (
          <div className="p-3 border border-red-500 bg-red-950/60 text-red-300 text-xs">
            [ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          
          {/* Select Game */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 opacity-70">
              01 // SELECT GAME MODULE
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'SNAKE_LADDER', name: 'SNAKE & LADDER', sub: '100 Tile Climb' },
                { id: 'LUDO', name: 'LUDO CLASSIC', sub: '4 Token Race' },
                { id: 'UNO', name: 'CLASSIC UNO', sub: 'Single Sided' },
                { id: 'UNO_FLIP', name: 'UNO FLIP!', sub: 'Dual Sided Battle' },
              ].map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGameType(g.id)}
                  className={`p-3 border text-left flex flex-col justify-between transition-all ${
                    gameType === g.id
                      ? 'border-[var(--text)] bg-[var(--border)] text-[var(--accent)] font-bold'
                      : 'border-[var(--border)] bg-[var(--bg)] opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="font-bold text-xs">[{g.name}]</div>
                  <div className="text-[9px] opacity-70 mt-1">{g.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 opacity-70">
              02 // MAXIMUM PLAYERS CAPACITY
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMaxPlayers(num)}
                  className={`py-2 text-xs font-bold border transition-all ${
                    maxPlayers === num
                      ? 'border-[var(--text)] bg-[var(--border)] text-[var(--accent)]'
                      : 'border-[var(--border)] bg-[var(--bg)] opacity-70'
                  }`}
                >
                  [{num} PLAYERS]
                </button>
              ))}
            </div>
          </div>

          {/* UNO Room Settings */}
          {isUnoGame && (
            <div className="p-4 border border-[var(--border)] bg-[var(--bg)] space-y-4">
              <div className="font-bold text-[var(--accent)] border-b border-[var(--border)] pb-1 text-[11px]">
                [ UNO GAME PARAMETERS ]
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Starting Hand Size */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 opacity-70">
                    STARTING CARDS PER PLAYER
                  </label>
                  <div className="flex gap-1.5">
                    {[5, 6, 7, 8, 10].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setStartingHandSize(c)}
                        className={`flex-1 py-1.5 text-xs font-bold border ${
                          startingHandSize === c
                            ? 'border-[var(--text)] bg-[var(--border)] text-[var(--accent)]'
                            : 'border-[var(--border)] bg-[var(--panel-bg)] opacity-70'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Per-Turn Timer */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 opacity-70">
                    PER-TURN TIMER DURATION
                  </label>
                  <div className="flex gap-1.5">
                    {[15, 30, 45, 60, 90].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTurnTimerDuration(t)}
                        className={`flex-1 py-1.5 text-xs font-bold border ${
                          turnTimerDuration === t
                            ? 'border-[var(--text)] bg-[var(--border)] text-[var(--accent)]'
                            : 'border-[var(--border)] bg-[var(--panel-bg)] opacity-70'
                        }`}
                      >
                        {t}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Controls */}
          <div className="p-4 border border-[var(--border)] bg-[var(--bg)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-[var(--accent)]">PRIVATE ROOM ACCESS</div>
                <div className="text-[10px] opacity-70">Require passcode authentication for players</div>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            {isPrivate && (
              <div className="pt-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER ACCESS PASSWORD"
                  className="w-full bg-[var(--panel-bg)] text-[var(--text)] text-xs p-2 border border-[var(--border)] focus:outline-none focus:border-[var(--text)]"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="term-button w-full py-3 text-xs font-bold"
          >
            {loading ? '[ INITIALIZING ROOM... ]' : '[ INITIALIZE ROOM & GENERATE CODE ]'}
          </button>
        </form>

      </div>
    </div>
  );
};
