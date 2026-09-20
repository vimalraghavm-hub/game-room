import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = {
  CRT: {
    id: 'CRT',
    name: 'CRT Terminal',
    emoji: '📟',
    bg: '#050807',
    panelBg: '#08100D',
    text: '#57FFB0',
    border: '#1E6E55',
    accent: '#A7FFD7',
  },
  PURPLE: {
    id: 'PURPLE',
    name: 'Purple CRT',
    emoji: '👾',
    bg: '#09050F',
    panelBg: '#120A1F',
    text: '#D8B4FE',
    border: '#6B21A8',
    accent: '#F3E8FF',
  },
  AMBER: {
    id: 'AMBER',
    name: 'Amber Terminal',
    emoji: '📻',
    bg: '#0B0702',
    panelBg: '#170E04',
    text: '#F59E0B',
    border: '#78350F',
    accent: '#FDE68A',
  },
  MONO: {
    id: 'MONO',
    name: 'Clean Mono',
    emoji: '💻',
    bg: '#0A0A0A',
    panelBg: '#121212',
    text: '#E5E5E5',
    border: '#404040',
    accent: '#FFFFFF',
  },
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('gameroom_theme') || 'CRT';
  });

  const [crtEnabled, setCrtEnabledState] = useState(() => {
    const saved = localStorage.getItem('gameroom_crt_fx');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gameroom_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('gameroom_crt_fx', crtEnabled);
  }, [crtEnabled]);

  const setTheme = (newTheme) => {
    if (THEMES[newTheme]) {
      setThemeState(newTheme);
    }
  };

  const toggleCrt = () => {
    setCrtEnabledState(prev => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig: THEMES[theme] || THEMES.CRT,
        setTheme,
        crtEnabled,
        setCrtEnabled: setCrtEnabledState,
        toggleCrt,
      }}
    >
      <div className={`min-h-screen relative font-mono selection:bg-emerald-500 selection:text-black ${crtEnabled ? 'crt-scanlines' : ''}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
