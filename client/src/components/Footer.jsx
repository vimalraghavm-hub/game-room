import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--panel-bg)] text-[var(--text)] py-4 mt-auto font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-[var(--accent)]">GAMEROOM // TERMINAL ENGINE</span>
          <span className="opacity-70 block text-[10px]">SYSTEM STATUS: ONLINE // SERVER AUTHORITATIVE</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px] opacity-80">
          <span>[ 01 // SNAKE & LADDER ]</span>
          <span>[ 02 // LUDO ]</span>
          <span>[ 03 // CLASSIC UNO ]</span>
          <span>[ 04 // UNO FLIP ]</span>
        </div>

        <div className="text-[10px] opacity-60 text-center md:text-right">
          BUILD: v2.4.0 // DEPLOYED ON RENDER
        </div>
      </div>
    </footer>
  );
};
