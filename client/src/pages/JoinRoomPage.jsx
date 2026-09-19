import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { Users, KeyRound, Lock, ShieldAlert, ArrowRight } from 'lucide-react';

export const JoinRoomPage = () => {
  const { codeParam } = useParams();
  const { joinRoom } = useSocket();
  const navigate = useNavigate();

  const [roomCode, setRoomCode] = useState(codeParam || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (codeParam) {
      setRoomCode(codeParam.toUpperCase());
    }
  }, [codeParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    setError('');
    setLoading(true);

    try {
      const formattedCode = roomCode.trim().toUpperCase();
      const res = await joinRoom(formattedCode, password);
      if (res?.roomCode) {
        navigate(`/room/${res.roomCode}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to join room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-cyan-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/40">
            <Users className="w-7 h-7 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-black text-white">Join Game Room</h2>
          <p className="text-slate-400 text-sm mt-1">Enter your friend's 5-character Room Code</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-center gap-3 text-red-300 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Room Code (e.g. AB7KQ)
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                maxLength={10}
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="AB7KQ"
                className="w-full bg-slate-950 text-cyan-300 font-mono font-black text-xl tracking-widest pl-11 pr-4 py-3.5 rounded-xl border border-slate-800 uppercase focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Room Password (If Private)
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Optional password"
                className="w-full bg-slate-950 text-white text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !roomCode.trim()}
            className="w-full py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-lg shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Joining Room...' : 'JOIN ROOM'} <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
};
