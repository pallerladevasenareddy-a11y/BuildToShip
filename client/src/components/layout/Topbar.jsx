import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';

export function Topbar() {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await api.get('/health');
        setHealth(res.data);
      } catch {
        setHealth(null);
      }
    }
    fetchHealth();
  }, []);

  return (
    <header className="h-16 bg-sidebar/80 backdrop-blur-md border-b border-border fixed top-0 right-0 left-64 z-20 px-8 flex items-center justify-between">
      {/* Left: Currency & System Indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-card border border-border text-xs text-mutedText">
          <span className="font-semibold text-primaryText">Display Currency:</span>
          <span className="text-accent font-bold">INR (₹)</span>
        </div>

        {health && (
          <div className="hidden md:flex items-center gap-2 text-xs text-mutedText">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>AI Model: <strong className="text-primaryText">{health.integrations?.gemini?.model || 'gemini-2.5-flash'}</strong></span>
          </div>
        )}
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pr-2 border-r border-border">
          <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-accent text-sm font-semibold">
            {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-primaryText leading-none">{user?.fullName || 'User'}</p>
            <p className="text-[10px] text-mutedText mt-0.5">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign out of account"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-mutedText hover:text-state-error hover:bg-state-error/10 border border-transparent hover:border-state-error/20 transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
