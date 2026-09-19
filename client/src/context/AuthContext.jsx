import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize guest profile if not logged in
  const getGuestProfile = () => {
    let saved = localStorage.getItem('gameroom_guest_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const randId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const guestUser = {
      id: `guest_${Date.now()}_${randId}`,
      username: `Player_${randId}`,
      email: `guest_${randId}@gameroom.online`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=GameRoom_${randId}`,
      gamesPlayed: 0,
      gamesWon: 0,
      isGuest: true,
    };
    localStorage.setItem('gameroom_guest_user', JSON.stringify(guestUser));
    return guestUser;
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!supabase) {
        if (mounted) {
          const guest = getGuestProfile();
          setUser(guest);
          setProfile(guest);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchProfile(session.user);
        } else if (mounted) {
          const guest = getGuestProfile();
          setUser(guest);
          setProfile(guest);
        }
      } catch (err) {
        console.warn('Auth init error:', err);
        if (mounted) {
          const guest = getGuestProfile();
          setUser(guest);
          setProfile(guest);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    let authListener = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          const guest = getGuestProfile();
          setUser(guest);
          setProfile(guest);
        }
      });
      authListener = data.subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  const fetchProfile = async (authUser) => {
    setUser(authUser);
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data && !error) {
        setProfile({
          id: data.id,
          username: data.username,
          email: data.email,
          avatar: data.avatar_url,
          gamesPlayed: data.games_played || 0,
          gamesWon: data.games_won || 0,
          isGuest: false,
        });
      } else {
        // Fallback
        setProfile({
          id: authUser.id,
          username: authUser.user_metadata?.username || authUser.email.split('@')[0],
          email: authUser.email,
          avatar: authUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${authUser.id}`,
          gamesPlayed: 0,
          gamesWon: 0,
          isGuest: false,
        });
      }
    } catch (err) {
      console.warn('Fetch profile error:', err);
    }
  };

  const login = async (email, password) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Running in guest mode.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, username) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Running in guest mode.');
    }
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, avatar_url: avatar },
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    const guest = getGuestProfile();
    setUser(guest);
    setProfile(guest);
  };

  const resetPassword = async (email) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  };

  const updateUsername = (newUsername) => {
    if (profile) {
      const updated = { ...profile, username: newUsername };
      setProfile(updated);
      if (profile.isGuest) {
        localStorage.setItem('gameroom_guest_user', JSON.stringify(updated));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
