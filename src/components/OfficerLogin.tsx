import React, { useState } from 'react';
import { Shield, Lock, User, Key, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { OfficerProfile } from '../types/screening';
import { authenticateOfficer, AUTHORIZED_OFFICERS_REGISTRY } from '../services/authService';

interface OfficerLoginProps {
  onLoginSuccess: (officer: OfficerProfile) => void;
  isDark: boolean;
}

export const OfficerLogin: React.FC<OfficerLoginProps> = ({ onLoginSuccess, isDark }) => {
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!officerId.trim()) {
      setErrorMsg('Please enter an authorized Officer ID.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your access security passcode.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const authResult = authenticateOfficer(officerId, password);
      if (authResult.success && authResult.officer) {
        onLoginSuccess(authResult.officer);
      } else {
        setErrorMsg(authResult.error || 'Authentication failed. Please verify credentials.');
      }
    }, 450);
  };

  const handleSelectOfficerPill = (id: string) => {
    setOfficerId(id);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <div
        className={`w-full max-w-md rounded-2xl border p-8 shadow-2xl transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-100 shadow-[0_0_40px_rgba(6,182,212,0.1)]'
            : 'bg-white/95 border-black/10 text-black shadow-xl'
        }`}
      >
        {/* Shield Icon & Header */}
        <div className="text-center space-y-2 mb-6">
          <div
            className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center border ${
              isDark ? 'bg-cyan-950/60 border-cyan-700/50 text-cyan-400' : 'bg-black/5 border-black/10 text-black'
            }`}
          >
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="font-heading-custom text-2xl font-bold tracking-tight">
            Authorized Officer Portal
          </h2>
          <p className="text-xs font-mono opacity-60">
            Ministry of Home Affairs // SIH26188 Gateway
          </p>
        </div>

        {/* Security badges */}
        <div className="grid grid-cols-2 gap-2 mb-6 text-[11px] font-mono text-center">
          <div className="p-2 rounded-lg border border-black/10 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted Session</span>
          </div>
          <div className="p-2 rounded-lg border border-black/10 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
            <span>Personnel Only</span>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider opacity-70">
                Officer ID
              </label>
              <span className="text-[10px] font-mono opacity-50">hardik / kshama / alkesh</span>
            </div>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                placeholder="e.g. hardik, kshama, or alkesh"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 focus:border-cyan-400 text-white'
                    : 'bg-slate-50 border-black/15 focus:border-black text-black'
                }`}
                autoComplete="username"
              />
            </div>

            {/* Quick Officer Selector Pills */}
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[10px] font-mono opacity-50">Select:</span>
              {Object.keys(AUTHORIZED_OFFICERS_REGISTRY).map((key) => {
                const entry = AUTHORIZED_OFFICERS_REGISTRY[key];
                const isSelected = officerId.toLowerCase().trim() === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectOfficerPill(key)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold'
                          : 'bg-black text-white border-black'
                        : isDark
                        ? 'border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-300'
                        : 'border-black/10 hover:border-black/25 bg-black/[0.02] text-black/70'
                    }`}
                  >
                    {entry.name.replace('Officer ', '')}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider opacity-70">
                Passcode / Security Key
              </label>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter 10-digit passcode"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 focus:border-cyan-400 text-white'
                    : 'bg-slate-50 border-black/15 focus:border-black text-black'
                }`}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 ${
              isDark
                ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Verifying Security Token...' : 'Sign In to Clearance Terminal'}</span>
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-4 border-t border-black/10 dark:border-slate-800 text-center">
          <p className="text-[11px] font-mono opacity-60">
            Protected under Ministry of Home Affairs Protocol. Only authorized personnel possessing valid credentials can access this portal.
          </p>
        </div>
      </div>
    </div>
  );
};

