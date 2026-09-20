import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Gamepad2, Lock, Users, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

export const CreateRoomPage = () => {
  const [searchParams] = useSearchParams();
  const initialGame = searchParams.get('game') || 'SNAKE_LADDER';

  const { createRoom } = useSocket();
  const navigate = useNavigate();

  const [gameType, setGameType] = useState(initialGame);
  const [maxPlayers, setMaxPlayers] = useState(4);
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
      });

      if (res?.roomCode) {
        navigate(`/room/${res.roomCode}`);
      } else {
        setError('Room creation failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Unable to create room. Please check connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-purple-500/40">
            <Gamepad2 className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-3xl font-black text-white">Create Game Room</h2>
          <p className="text-slate-400 text-sm mt-1">Configure your room settings and invite your friends</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center gap-3 text-red-300 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Select Game */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Choose Game
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setGameType('SNAKE_LADDER')}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                  gameType === 'SNAKE_LADDER'
                    ? 'bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/40 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-3xl mb-2">🎲</span>
                <div>
                  <h4 className="font-extrabold text-white text-sm">Snake & Ladder</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Classic 100 climb</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGameType('LUDO')}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                  gameType === 'LUDO'
                    ? 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/40 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-3xl mb-2">🟢</span>
                <div>
                  <h4 className="font-extrabold text-white text-sm">Ludo Online</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">4-token race & capture</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGameType('UNO')}
                className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition-all ${
                  gameType === 'UNO'
                    ? 'bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-3xl mb-2">🃏</span>
                <div>
                  <h4 className="font-extrabold text-white text-sm">UNO Card Game</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Match colors & action cards</p>
                </div>
              </button>
            </div>
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              2. Maximum Players
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMaxPlayers(num)}
                  className={`py-3 rounded-xl font-extrabold text-sm border transition-all ${
                    maxPlayers === num
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {num} Players
                </button>
              ))}
            </div>
          </div>

          {/* Room Privacy */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-200 text-sm">Private Room</h4>
                <p className="text-xs text-slate-400">Require a password for players joining</p>
              </div>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
              />
            </div>

            {isPrivate && (
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Optional Room Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter room password"
                    className="w-full bg-slate-900 text-white text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-lg shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Room...' : 'CREATE ROOM & GET CODE'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};
