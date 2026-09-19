import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gamepad2, User, LogOut, LogIn, UserPlus, Menu, X, Trophy } from 'lucide-react';

export const Navbar = () => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-purple-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-wider bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                GAME ROOM
              </span>
              <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Online Multiplayer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Games
            </Link>
            <Link to="/create-room" className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Create Room
            </Link>
            <Link to="/join" className="text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
              Join Room
            </Link>

            {profile && !profile.isGuest ? (
              <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700/60 transition-all"
                >
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-7 h-7 rounded-full bg-slate-900 border border-purple-500"
                  />
                  <span className="text-sm font-bold text-slate-200">{profile.username}</span>
                  <Trophy className="w-4 h-4 text-amber-400 ml-1" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" /> Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            Home & Games
          </Link>
          <Link
            to="/create-room"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-purple-400 hover:bg-slate-800"
          >
            Create Room
          </Link>
          <Link
            to="/join"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-cyan-400 hover:bg-slate-800"
          >
            Join Room
          </Link>

          {profile && !profile.isGuest ? (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-base font-semibold text-slate-200"
              >
                <img src={profile.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-purple-500" />
                {profile.username}
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-400 font-semibold hover:bg-slate-800 rounded-md"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold text-slate-200 bg-slate-800 rounded-xl"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-bold text-white bg-purple-600 rounded-xl shadow-md"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
