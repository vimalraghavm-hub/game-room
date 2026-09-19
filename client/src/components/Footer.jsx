import React from 'react';
import { Gamepad2, Heart, Shield, Users, Zap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center border border-purple-500/40">
              <Gamepad2 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="font-bold text-slate-200">GameRoom</span>
              <span className="text-xs text-slate-500 block">Real-time Online Multiplayer Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Server Authoritative
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" /> Supabase Secured
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" /> 2-4 Players Sync
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right">
            Made with <Heart className="w-3.5 h-3.5 text-pink-500 inline mx-0.5" /> for friends everywhere.
          </div>
        </div>
      </div>
    </footer>
  );
};
