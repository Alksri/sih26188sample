import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Shield,
  User,
  LogOut,
  Cpu,
  Menu,
  X,
  Sparkles,
  History,
  Activity,
  Layers,
  LayoutDashboard
} from 'lucide-react';
import { OfficerProfile } from '../types/screening';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: 'hero' | 'dashboard' | 'workflow' | 'audit' | 'analytics' | 'architecture' | 'login') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  officer: OfficerProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  theme,
  onToggleTheme,
  officer,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  const handleNavClick = (view: 'hero' | 'dashboard' | 'workflow' | 'audit' | 'analytics' | 'architecture' | 'login') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 w-full px-4 sm:px-8 py-3 sm:py-4 flex flex-row justify-between items-center backdrop-blur-md transition-all border-b ${
          isDark
            ? 'bg-[#0b0f19]/90 border-slate-800/80 text-slate-100'
            : 'bg-[#f4f4f0]/95 border-black/[0.08] text-black'
        }`}
      >
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => handleNavClick('hero')}
            className="flex flex-row items-center gap-2 text-left group cursor-pointer focus:outline-none"
          >
            <span className="font-heading-custom text-xl sm:text-2xl tracking-tight font-bold leading-none">
              Aegis®
            </span>
            <span
              className={`text-lg select-none group-hover:rotate-45 transition-transform duration-300 ${
                isDark ? 'text-cyan-400' : 'text-black'
              }`}
            >
              ✳︎
            </span>
          </button>

          {/* MHA Identifier tag */}
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[10px] font-mono border border-black/10 dark:border-slate-800 text-black/60 dark:text-slate-400">
            MHA // SIH26188
          </span>
        </div>

        {/* Center: Desktop Nav Links (hidden on mobile/tablet) */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 text-[15px] font-medium">
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'dashboard'
                ? isDark
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'bg-black/5 text-black font-semibold'
                : 'hover:opacity-70'
            }`}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('workflow')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'workflow'
                ? isDark
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'bg-black/5 text-black font-semibold'
                : 'hover:opacity-70'
            }`}
          >
            New Verification
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'audit'
                ? isDark
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'bg-black/5 text-black font-semibold'
                : 'hover:opacity-70'
            }`}
          >
            Audit Trail
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'analytics'
                ? isDark
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'bg-black/5 text-black font-semibold'
                : 'hover:opacity-70'
            }`}
          >
            Analytics
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('architecture')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              currentView === 'architecture'
                ? isDark
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'bg-black/5 text-black font-semibold'
                : 'hover:opacity-70'
            }`}
          >
            Architecture
          </button>
        </nav>

        {/* Right: Theme Toggle, Officer Session & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-white border-black/10 text-black/80 hover:bg-black/5'
            }`}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Cyber Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Gemini Engine badge (Desktop) */}
          <div
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
              isDark
                ? 'bg-slate-800/70 border-slate-700 text-cyan-300'
                : 'bg-black/5 border-black/10 text-black/80'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-500" />
            <span className="font-semibold">Gemini 2.5</span>
          </div>

          {/* Officer Status (Desktop) */}
          {officer ? (
            <div className="hidden sm:flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono ${
                  isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-black/15 shadow-sm'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-medium truncate max-w-[110px]">{officer.name}</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleNavClick('login')}
              className={`hidden sm:flex px-3.5 py-1.5 rounded-full text-xs font-semibold items-center gap-1.5 transition-all cursor-pointer border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-white border-black/15 text-black hover:bg-black hover:text-white shadow-sm'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* MOBILE HAMBURGER BUTTON (Visible below lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border lg:hidden transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-cyan-400'
                : 'bg-white border-black/15 text-black'
            }`}
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE FULL-FEATURE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div
          className={`fixed inset-x-0 top-[57px] sm:top-[65px] bottom-0 z-30 lg:hidden overflow-y-auto p-5 backdrop-blur-xl transition-all border-b shadow-2xl ${
            isDark
              ? 'bg-[#0b0f19]/98 border-slate-800 text-slate-100'
              : 'bg-[#f4f4f0]/98 border-black/10 text-black'
          }`}
        >
          <div className="space-y-4 max-w-md mx-auto">
            {/* Officer Status Card on Mobile */}
            {officer ? (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-black/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs font-mono">{officer.name}</div>
                    <div className="text-[10px] font-mono opacity-60">Badge: {officer.badgeNumber}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 rounded text-xs font-mono text-red-500 border border-red-500/30 hover:bg-red-500/10"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('login')}
                className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs font-mono flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" /> Officer Sign In
              </button>
            )}

            {/* Navigation Links (Touch-Optimized) */}
            <div className="space-y-1.5 font-mono text-sm">
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'hover:bg-black/5 dark:hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-500" />
                <span>Command Dashboard</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('workflow')}
                className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors ${
                  currentView === 'workflow'
                    ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'hover:bg-black/5 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4 text-cyan-500" />
                <span>New Verification Pipeline</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('audit')}
                className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors ${
                  currentView === 'audit'
                    ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'hover:bg-black/5 dark:hover:bg-slate-800'
                }`}
              >
                <History className="w-4 h-4 text-cyan-500" />
                <span>Digital Audit Trail Ledger</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('analytics')}
                className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors ${
                  currentView === 'analytics'
                    ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'hover:bg-black/5 dark:hover:bg-slate-800'
                }`}
              >
                <Activity className="w-4 h-4 text-cyan-500" />
                <span>Screening Analytics</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('architecture')}
                className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-colors ${
                  currentView === 'architecture'
                    ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30'
                    : 'hover:bg-black/5 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-500" />
                <span>Architecture & How AI Works</span>
              </button>
            </div>

            {/* Telemetry info at bottom of mobile menu */}
            <div className="pt-4 border-t border-black/10 dark:border-slate-800 text-xs font-mono opacity-60 flex justify-between">
              <span>Engine: Gemini 2.5 Flash</span>
              <span className="text-emerald-500">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
