import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 font-mono text-[var(--text)]">
      
      {/* Profile Header Box */}
      <div className="term-box p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] text-xs font-bold">
          <span className="text-[var(--accent)]">[ USER DOSSIER // ACCOUNT ]</span>
          <span className="opacity-70">{profile?.isGuest ? 'GUEST ACCOUNT' : 'AUTHENTICATED'}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 border border-[var(--text)] bg-[var(--bg)] flex items-center justify-center text-2xl font-bold">
            {profile?.avatar ? <img src={profile.avatar} alt="User" className="w-full h-full object-cover" /> : '👤'}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="bg-[var(--bg)] text-[var(--text)] font-bold text-xs p-1.5 border border-[var(--text)]"
                  />
                  <button
                    onClick={handleSaveUsername}
                    className="term-button px-2 py-1 text-xs"
                  >
                    [SAVE]
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-[var(--accent)]">{profile?.username}</h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs opacity-70 hover:opacity-100"
                  >
                    [EDIT]
                  </button>
                </>
              )}
            </div>
            <div className="text-xs opacity-70">{profile?.email || 'GUEST USER'}</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
        <div className="term-box p-4 text-center">
          <span className="text-2xl font-black text-[var(--accent)] block">{gamesPlayed}</span>
          <span className="text-[10px] opacity-70 uppercase tracking-wider">GAMES PLAYED</span>
        </div>
        <div className="term-box p-4 text-center">
          <span className="text-2xl font-black text-[var(--accent)] block">{gamesWon}</span>
          <span className="text-[10px] opacity-70 uppercase tracking-wider">GAMES WON</span>
        </div>
        <div className="term-box p-4 text-center">
          <span className="text-2xl font-black text-[var(--accent)] block">{winRate}%</span>
          <span className="text-[10px] opacity-70 uppercase tracking-wider">WIN RATE</span>
        </div>
      </div>

      {/* Match History */}
      <div className="term-box p-6 space-y-4 text-xs">
        <div className="font-bold text-[var(--accent)] border-b border-[var(--border)] pb-2">
          [ MATCH HISTORY LOGS ]
        </div>

        {loadingHistory ? (
          <div className="text-center opacity-50 py-4">// FETCHING MATCH LOGS...</div>
        ) : history.length === 0 ? (
          <div className="text-center opacity-50 py-6 border border-dashed border-[var(--border)]">
            // NO MATCH HISTORY LOGGED YET. PLAY ONLINE TO SAVE STATS.
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 border border-[var(--border)] bg-[var(--bg)] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[var(--accent)]">
                    {item.games?.game_type || 'GAME'}
                  </span>
                  <span className="text-[10px] opacity-60 block">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="font-bold">
                  [{item.rank === 1 ? '🏆 WINNER' : `RANK #${item.rank}`}]
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
