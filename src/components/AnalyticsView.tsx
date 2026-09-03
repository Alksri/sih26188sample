import React from 'react';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Clock,
  PieChart,
  BarChart3
} from 'lucide-react';

interface AnalyticsViewProps {
  isDark: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ isDark }) => {
  return (
    <section className="pt-24 pb-16 px-5 sm:px-8 md:px-12 max-w-7xl mx-auto space-y-8">
      <div className="pb-6 border-b border-black/10 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-cyan-500" />
          <span className="text-xs font-mono uppercase tracking-wider opacity-60">
            Intelligence Telemetry // Border Analytics
          </span>
        </div>
        <h1 className="font-heading-custom text-3xl font-bold tracking-tight">
          Border Identity Screening Analytics
        </h1>
        <p className="text-xs sm:text-sm opacity-70 mt-1">
          Aggregated performance indices, fraudulent forgery distribution, and biometric screening latency trends.
        </p>
      </div>

      {/* Grid of Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Screening Volume (SVG Bar Chart) */}
        <div
          className={`p-6 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-heading-custom text-base font-bold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span>Daily Screening Volume & Fraud Detection</span>
              </h3>
              <p className="text-xs font-mono opacity-60">Screened vs Forgery Flagged over the last 7 days</p>
            </div>
            <span className="text-xs font-mono text-emerald-500">+12% vs last week</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-black/10 dark:border-slate-800">
            {[
              { day: 'Mon', total: 180, flag: 8 },
              { day: 'Tue', total: 210, flag: 12 },
              { day: 'Wed', total: 195, flag: 9 },
              { day: 'Thu', total: 240, flag: 14 },
              { day: 'Fri', total: 260, flag: 18 },
              { day: 'Sat', total: 220, flag: 11 },
              { day: 'Sun', total: 190, flag: 6 },
            ].map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.total}
                </div>
                <div className="w-full max-w-[28px] flex flex-col justify-end h-full">
                  <div
                    className="w-full bg-cyan-500/80 rounded-t transition-all group-hover:bg-cyan-400"
                    style={{ height: `${(d.total / 260) * 100}%` }}
                  >
                    <div
                      className="w-full bg-red-500 rounded-t"
                      style={{ height: `${(d.flag / d.total) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-mono opacity-70">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 text-xs font-mono opacity-70">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500" /> Total Screened
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-red-500" /> Flagged Forgeries
              </span>
            </div>
            <span>Avg: 213/day</span>
          </div>
        </div>

        {/* Chart 2: Risk Distribution (Specified: Low: 76%, Medium: 17%, High: 7%) */}
        <div
          className={`p-6 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-heading-custom text-base font-bold flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-500" />
                <span>Risk Distribution Spectrum</span>
              </h3>
              <p className="text-xs font-mono opacity-60">Automated Bayesian Categorization (N = 1,284)</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
              High Confidence
            </span>
          </div>

          {/* Donut Chart Simulation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Low Risk Segment (76%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 - 238.76 * 0.76}
                />
                {/* Medium Risk Segment (17%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 - 238.76 * 0.17}
                  className="rotate-[273deg] origin-center"
                />
                {/* High Risk Segment (7%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray="238.76"
                  strokeDashoffset={238.76 - 238.76 * 0.07}
                  className="rotate-[334deg] origin-center"
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-xl font-mono font-bold">1,284</div>
                <div className="text-[9px] font-mono opacity-60">CASES</div>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="flex items-center gap-1.5 font-bold text-emerald-600">
                  <ShieldCheck className="w-4 h-4" /> LOW RISK
                </span>
                <span className="font-bold">76% (976)</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="flex items-center gap-1.5 font-bold text-amber-600">
                  <AlertTriangle className="w-4 h-4" /> MEDIUM RISK
                </span>
                <span className="font-bold">17% (218)</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <span className="flex items-center gap-1.5 font-bold text-red-600">
                  <AlertTriangle className="w-4 h-4" /> HIGH RISK
                </span>
                <span className="font-bold">7% (90)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Tampering Forgery Categories Breakdown */}
        <div
          className={`p-6 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
          }`}
        >
          <h3 className="font-heading-custom text-base font-bold mb-4">
            Forgery Modality Interceptions
          </h3>
          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span>Photo Substitution / Digital Edge Clone</span>
                <span className="font-bold">44% of threats</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/10 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '44%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Visa / Passport Number Glyph Kerning Alterations</span>
                <span className="font-bold">29% of threats</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/10 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '29%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Consular Seal & Security Watermark Forgery</span>
                <span className="font-bold">18% of threats</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/10 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Presenter Imposter / Biometric Divergence</span>
                <span className="font-bold">9% of threats</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/10 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '9%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Chart 4: Verification Latency Efficiency */}
        <div
          className={`p-6 rounded-2xl border flex flex-col justify-between ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
          }`}
        >
          <div>
            <h3 className="font-heading-custom text-base font-bold mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-500" />
              <span>Inspection Latency Benchmark</span>
            </h3>
            <p className="text-xs font-mono opacity-60 mb-4">
              Manual inspection vs Aegis AI automated throughput
            </p>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 rounded-xl border border-black/10 dark:border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span>Traditional Manual Border Scrutiny</span>
                  <span className="font-bold text-red-500">~300 seconds (5.0 min)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-slate-800">
                  <div className="h-full bg-red-400 rounded-full w-full" />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex justify-between text-xs mb-1">
                  <span>Aegis SIH26188 Cloud Neural Verification</span>
                  <span className="font-bold text-emerald-500">4.8 seconds (98.4% faster)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-slate-800">
                  <div className="h-full bg-emerald-500 rounded-full w-[4%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-black/10 dark:border-slate-800 text-[11px] font-mono opacity-60 flex justify-between">
            <span>AI Neural Engine Active</span>
            <span>Zero Queue Congestion</span>
          </div>
        </div>
      </div>
    </section>
  );
};
