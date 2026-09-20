import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme, THEMES } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Monitor, Palette } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();
  const { theme, setTheme, crtEnabled, toggleCrt } = useTheme();
  const { user, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'GAMES' },
    { path: '/create-room', label: 'CREATE' },
    { path: '/join', label: 'JOIN' },
    { path: '/profile', label: user ? (profile?.username || 'PROFILE') : 'LOGIN' },
  ];

  return (
    <header className="border-b border-[var(--border)] bg-[var(--panel-bg)] text-[var(--text)] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-lg font-black tracking-wider text-[var(--accent)] font-mono">
            GAMEROOM <span className="text-xs font-normal opacity-80">// OS_v2.0</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 text-xs font-bold font-mono">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 border transition-all ${
                  isActive
                    ? 'border-[var(--text)] bg-[var(--border)] text-[var(--accent)]'
                    : 'border-transparent hover:border-[var(--border)] text-[var(--text)]'
                }`}
              >
                [{link.label}]
              </Link>
            );
          })}
        </div>

        {/* Controls: Theme Selector & CRT Toggle */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
          {/* Theme Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="px-2.5 py-1.5 border border-[var(--border)] bg-[var(--bg)] hover:border-[var(--text)] flex items-center gap-1.5 transition-colors"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>THEME: {theme}</span>
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-44 border border-[var(--border)] bg-[var(--panel-bg)] shadow-2xl z-50 p-1 space-y-1">
                {Object.values(THEMES).map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1 text-xs border flex items-center justify-between transition-colors ${
                      theme === t.id
                        ? 'border-[var(--text)] bg-[var(--border)] text-[var(--accent)] font-bold'
                        : 'border-transparent hover:border-[var(--border)]'
                    }`}
                  >
                    <span>{t.emoji} {t.name}</span>
                    {theme === t.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CRT FX Toggle */}
          <button
            type="button"
            onClick={toggleCrt}
            className={`px-2.5 py-1.5 border flex items-center gap-1.5 transition-colors ${
              crtEnabled
                ? 'border-[var(--text)] bg-[var(--border)] text-[var(--accent)] font-bold'
                : 'border-[var(--border)] bg-[var(--bg)] text-[var(--text)] opacity-70'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>CRT: {crtEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 border border-[var(--border)] text-[var(--text)]"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--panel-bg)] p-4 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 border border-[var(--border)] text-center text-[var(--text)] font-bold"
              >
                [{link.label}]
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-[var(--border)] space-y-2">
            <div className="text-[10px] uppercase font-bold text-[var(--text)] opacity-70">Theme Selection:</div>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(THEMES).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`p-1.5 border text-xs text-left ${
                    theme === t.id ? 'border-[var(--text)] bg-[var(--border)] text-[var(--accent)] font-bold' : 'border-[var(--border)]'
                  }`}
                >
                  {t.emoji} {t.id}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={toggleCrt}
              className="w-full p-2 border border-[var(--border)] text-center font-bold"
            >
              CRT EFFECT: {crtEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
