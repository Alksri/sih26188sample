import React, { useState } from 'react';
import { Shield, Lock, User, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { OfficerProfile } from '../types/screening';

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
      setErrorMsg('Please enter your access security credential.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        id: officerId,
        name: officerId.toLowerCase().includes('sharma') ? 'Insp. Rajesh Sharma' : 'Officer ' + officerId,
        badgeNumber: 'MHA-INSP-8492',
        checkpointLocation: 'Indira Gandhi Int’l Airport (DEL-T3)',
        clearanceLevel: 'LEVEL-4 TOP SECRET (IMMIGRATION & BORDER INTELLIGENCE)',
      });
    }, 600);
  };

  const handleQuickDemoLogin = () => {
    setOfficerId('MHA-INSP-8492');
    setPassword('••••••••••••');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        id: 'MHA-INSP-8492',
        name: 'Insp. Rajesh Sharma',
        badgeNumber: 'MHA-INSP-8492',
        checkpointLocation: 'Indira Gandhi Int’l Airport (DEL-T3)',
        clearanceLevel: 'LEVEL-4 TOP SECRET (IMMIGRATION & BORDER INTELLIGENCE)',
      });
    }, 400);
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
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-70">
              Officer ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                placeholder="e.g. MHA-INSP-8492"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-slate-700 focus:border-cyan-400 text-white'
                    : 'bg-slate-50 border-black/15 focus:border-black text-black'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider mb-1.5 opacity-70">
              Passcode / Cryptographic Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-slate-950 border-slate-700 focus:border-cyan-400 text-white'
                    : 'bg-slate-50 border-black/15 focus:border-black text-black'
                }`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50 ${
              isDark
                ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {loading ? 'Authenticating Security Token...' : 'Sign In to Clearance Terminal'}
          </button>
        </form>

        {/* Quick Demo Button */}
        <div className="mt-6 pt-5 border-t border-black/10 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            className={`w-full py-2 px-3 rounded-lg border text-xs font-mono transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              isDark
                ? 'border-slate-700 hover:bg-slate-800 text-cyan-400'
                : 'border-black/15 hover:bg-black/5 text-black/80'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>One-Click Hackathon Evaluator Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
