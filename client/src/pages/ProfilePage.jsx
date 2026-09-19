import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { User, Trophy, Gamepad2, Calendar, Mail, Edit3, Check, Shield } from 'lucide-react';

export const ProfilePage = () => {
  const { profile, updateUsername } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(profile?.username || '');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (profile?.username) setNewUsername(profile.username);
  }, [profile]);

  useEffect(() => {
    async function fetchHistory() {
      if (!supabase || profile?.isGuest) {
        setLoadingHistory(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('game_players')
          .select(`
            rank,
            score,
            created_at,
            games (
              game_type,
              duration_seconds,
              winner_id
            )
          `)
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (data && !error) {
          setHistory(data);
        }
      } catch (err) {
        console.warn('Fetch history error:', err);
      } finally {
        setLoadingHistory(false);
      }
    }

    fetchHistory();
  }, [profile]);

  const handleSaveUsername = () => {
    if (newUsername.trim()) {
      updateUsername(newUsername.trim());
      setEditing(false);
    }
  };

  const gamesPlayed = profile?.gamesPlayed || 0;
  const gamesWon = profile?.gamesWon || 0;
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      
      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <img
            src={profile?.avatar}
            alt={profile?.username}
            className="w-24 h-24 rounded-full border-4 border-purple-500 bg-slate-950 shadow-xl object-cover"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-slate-950 text-white font-bold px-3 py-1.5 rounded-xl border border-purple-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-white">{profile?.username}</h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 text-slate-400 hover:text-purple-400 transition-colors"
                    title="Edit Username"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-purple-400" /> {profile?.email}
              </span>
              {profile?.isGuest && (
                <span className="bg-amber-500/20 text-amber-400 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Guest Account
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-1">
          <Gamepad2 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <span className="text-3xl font-black text-white block">{gamesPlayed}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Games Played</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-1">
          <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <span className="text-3xl font-black text-white block">{gamesWon}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Games Won</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-center space-y-1">
          <Shield className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <span className="text-3xl font-black text-white block">{winRate}%</span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Win Rate</span>
        </div>
      </div>

      {/* Recent Match History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> Recent Match History
        </h3>

        {loadingHistory ? (
          <div className="text-center text-slate-500 text-sm py-8">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8 italic border border-dashed border-slate-800 rounded-2xl">
            No match history recorded yet. Play a match online to save your results! 🎲
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {item.games?.game_type === 'SNAKE_LADDER' ? '🎲' : '🟢'}
                  </span>
                  <div>
                    <span className="font-bold text-slate-200 block">
                      {item.games?.game_type === 'SNAKE_LADDER' ? 'Snake & Ladder' : 'Ludo'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-xs px-3 py-1 rounded-full uppercase ${
                      item.rank === 1
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.rank === 1 ? '🏆 Winner' : `Rank #${item.rank}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
