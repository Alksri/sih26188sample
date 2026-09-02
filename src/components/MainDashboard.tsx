import React from 'react';
import {
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Eye,
  Fingerprint,
  Activity,
  History,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { OfficerProfile } from '../types/screening';

interface MainDashboardProps {
  officer: OfficerProfile;
  onStartNewVerification: () => void;
  onSelectDemoCase: (caseType: 'genuine' | 'tampered' | 'mismatch') => void;
  onNavigate: (view: 'workflow' | 'audit' | 'analytics') => void;
  isDark: boolean;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  officer,
  onStartNewVerification,
  onSelectDemoCase,
  onNavigate,
  isDark,
}) => {
  return (
    <section className="pt-24 pb-16 px-5 sm:px-8 md:px-12 max-w-7xl mx-auto space-y-8">
      {/* Officer Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono tracking-wider uppercase opacity-60">
              Terminal: {officer.checkpointLocation}
            </span>
          </div>
          <h1 className="font-heading-custom text-3xl sm:text-4xl font-bold tracking-tight">
            Security Clearance Command Dashboard
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Logged in as <strong>{officer.name}</strong> // Badge: {officer.badgeNumber}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onStartNewVerification}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-2 ${
              isDark
                ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch New Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOP METRICS KPI CARDS (Specified by user) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Metric 1: Screened */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">Screened</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold">1,284</div>
          <div className="text-[11px] opacity-60 mt-1 font-mono">+48 today</div>
        </div>

        {/* Metric 2: Verified */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">Verified</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-600">1,109</div>
          <div className="text-[11px] opacity-60 mt-1 font-mono">86.4% clearance</div>
        </div>

        {/* Metric 3: Suspicious */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">Suspicious</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-amber-600">127</div>
          <div className="text-[11px] opacity-60 mt-1 font-mono">Secondary review</div>
        </div>

        {/* Metric 4: High Risk */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">High Risk</span>
            <Shield className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-red-600">48</div>
          <div className="text-[11px] opacity-60 mt-1 font-mono">Interdictions</div>
        </div>

        {/* Metric 5: Avg Time */}
        <div
          className={`p-5 rounded-2xl border transition-all col-span-2 md:col-span-1 ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider opacity-60">Avg Time</span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold">4.8s</div>
          <div className="text-[11px] opacity-60 mt-1 font-mono">Reduced from ~5m</div>
        </div>
      </div>

      {/* QUICK DEMO PRESETS CARDS FOR EVALUATORS */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading-custom text-xl font-bold tracking-tight">
              One-Click SIH Hackathon Demo Scenarios
            </h2>
            <p className="text-xs font-mono opacity-60 mt-0.5">
              Instantly test each core capability without uploading external files
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            Pre-Calibrated Cases
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Demo 1 */}
          <div
            onClick={() => onSelectDemoCase('genuine')}
            className={`p-5 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01] ${
              isDark
                ? 'border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40'
                : 'border-emerald-500/30 bg-emerald-50/70 hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600">
                CASE 01 // PASS
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-heading-custom text-base font-bold mb-1">Genuine Diplomatic Visa</h3>
            <p className="text-xs opacity-70 mb-3">
              Flawless ICAO Doc 9303 checksums, intact UV micro-printing, and 97.4% facial match.
            </p>
            <div className="text-xs font-mono text-emerald-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Execute Demo →</span>
            </div>
          </div>

          {/* Demo 2 */}
          <div
            onClick={() => onSelectDemoCase('tampered')}
            className={`p-5 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01] ${
              isDark
                ? 'border-red-500/30 bg-red-950/20 hover:bg-red-950/40'
                : 'border-red-500/30 bg-red-50/70 hover:bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-600">
                CASE 02 // FORGERY
              </span>
              <Eye className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="font-heading-custom text-base font-bold mb-1">Tampered Document</h3>
            <p className="text-xs opacity-70 mb-3">
              Photo replacement border artifacts (82%), altered Visa Number font, and Modulo-7 MRZ checksum failure.
            </p>
            <div className="text-xs font-mono text-red-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Execute Demo →</span>
            </div>
          </div>

          {/* Demo 3 */}
          <div
            onClick={() => onSelectDemoCase('mismatch')}
            className={`p-5 rounded-xl border transition-all cursor-pointer group hover:scale-[1.01] ${
              isDark
                ? 'border-amber-500/30 bg-amber-950/20 hover:bg-amber-950/40'
                : 'border-amber-500/30 bg-amber-50/70 hover:bg-amber-50'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-600">
                CASE 03 // IMPOSTER
              </span>
              <Fingerprint className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-heading-custom text-base font-bold mb-1">Identity / Face Mismatch</h3>
            <p className="text-xs opacity-70 mb-3">
              Document itself is 100% genuine, but presenter similarity is only 41.2%. Lookalike alert.
            </p>
            <div className="text-xs font-mono text-amber-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Execute Demo →</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE AUDIT LOGS & RECENT TELEMETRY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Screenings Feed */}
        <div
          className={`lg:col-span-2 p-6 rounded-2xl border ${
            isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading-custom text-base font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-blue-500" />
              <span>Real-Time Checkpoint Ledger</span>
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('audit')}
              className="text-xs font-mono text-cyan-500 hover:underline cursor-pointer"
            >
              View All 1,284 Records →
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02] dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <div className="font-bold">SIH-2026-001284 // Diplomatic Visa</div>
                  <div className="text-[11px] opacity-60">Avanish Singh • Checked 2m ago</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 font-semibold">
                VERIFIED // PASS
              </span>
            </div>

            <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02] dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <div>
                  <div className="font-bold">SIH-2026-001285 // Passport</div>
                  <div className="text-[11px] opacity-60">Robert Parker • Forgery Flagged</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-red-500/10 text-red-600 font-semibold">
                HIGH RISK 86%
              </span>
            </div>

            <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02] dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <div>
                  <div className="font-bold">SIH-2026-001286 // Passport</div>
                  <div className="text-[11px] opacity-60">Presenter Imposter • 41% Match</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 font-semibold">
                SECONDARY REVIEW
              </span>
            </div>
          </div>
        </div>

        {/* Quick Officer Profile & Station Status */}
        <div
          className={`p-6 rounded-2xl border ${
            isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
          }`}
        >
          <h3 className="font-heading-custom text-base font-bold mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>Station Telemetry</span>
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="pb-2 border-b border-black/10 dark:border-slate-800">
              <span className="opacity-60 block">Officer In-Charge:</span>
              <span className="font-bold text-sm">{officer.name}</span>
            </div>
            <div className="pb-2 border-b border-black/10 dark:border-slate-800">
              <span className="opacity-60 block">Clearance Level:</span>
              <span className="font-semibold text-emerald-500">{officer.clearanceLevel}</span>
            </div>
            <div className="pb-2 border-b border-black/10 dark:border-slate-800">
              <span className="opacity-60 block">AI Neural Engine:</span>
              <span>Gemini 2.5 Flash Cloud (Active)</span>
            </div>
            <div>
              <span className="opacity-60 block">Cryptographic Hash Standard:</span>
              <span>SHA-256 Ledger Synchronized</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
