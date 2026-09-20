import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

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
    <div className="max-w-md mx-auto px-4 py-12 font-mono text-[var(--text)]">
      <div className="term-box p-6 space-y-6">
        
        {/* Header */}
        <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
          <span className="font-bold text-sm text-[var(--accent)]">[ AUTHENTICATION // JOIN ROOM ]</span>
          <span className="text-xs opacity-70">STATUS: READY</span>
        </div>

        {error && (
          <div className="p-3 border border-red-500 bg-red-950/60 text-red-300 text-xs">
            [ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 opacity-70">
              01 // ROOM CODE (E.G. H7K9Q)
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="H7K9Q"
              className="w-full bg-[var(--bg)] text-[var(--accent)] font-mono font-black text-xl tracking-widest p-3 border border-[var(--border)] uppercase focus:outline-none focus:border-[var(--text)]"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold tracking-wider mb-2 opacity-70">
              02 // ROOM PASSCODE (IF PRIVATE)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="OPTIONAL PASSCODE"
              className="w-full bg-[var(--bg)] text-[var(--text)] text-xs p-3 border border-[var(--border)] focus:outline-none focus:border-[var(--text)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !roomCode.trim()}
            className="term-button w-full py-3 text-xs font-bold"
          >
            {loading ? '[ AUTHENTICATING... ]' : '[ CONNECT TO ROOM ]'}
          </button>
        </form>

      </div>
    </div>
  );
};
