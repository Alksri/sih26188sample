import { useState, lazy, Suspense } from 'react';
import { ScanLine } from 'lucide-react';
import {
  VerificationCase,
  OfficerProfile
} from './types/screening';
import {
  DEMO_CASE_1_GENUINE,
  DEMO_CASE_2_TAMPERED,
  DEMO_CASE_3_FACE_MISMATCH
} from './services/aiEngine';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';

// Lazy load secondary modules for blazingly fast initial page load on Vercel
const OfficerLogin = lazy(() =>
  import('./components/OfficerLogin').then((m) => ({ default: m.OfficerLogin }))
);
const MainDashboard = lazy(() =>
  import('./components/MainDashboard').then((m) => ({ default: m.MainDashboard }))
);
const WorkflowPipeline = lazy(() =>
  import('./components/WorkflowPipeline').then((m) => ({ default: m.WorkflowPipeline }))
);
const AuditTrailView = lazy(() =>
  import('./components/AuditTrailView').then((m) => ({ default: m.AuditTrailView }))
);
const AnalyticsView = lazy(() =>
  import('./components/AnalyticsView').then((m) => ({ default: m.AnalyticsView }))
);
const ArchitectureView = lazy(() =>
  import('./components/ArchitectureView').then((m) => ({ default: m.ArchitectureView }))
);

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeView, setActiveView] = useState<
    'hero' | 'login' | 'dashboard' | 'workflow' | 'audit' | 'analytics' | 'architecture'
  >('hero');

  // Default logged in officer (or can log out)
  const [officer, setOfficer] = useState<OfficerProfile | null>({
    id: 'MHA-INSP-8492',
    name: 'Insp. Rajesh Sharma',
    badgeNumber: 'MHA-INSP-8492',
    checkpointLocation: 'Delhi Int’l Airport (DEL-T3)',
    clearanceLevel: 'LEVEL-4 TOP SECRET (BORDER INTELLIGENCE)',
  });

  // Current active case being screened
  const [currentCase, setCurrentCase] = useState<VerificationCase>(DEMO_CASE_1_GENUINE);

  // Digital audit trail ledger containing verified cases
  const [auditCases, setAuditCases] = useState<VerificationCase[]>([
    DEMO_CASE_1_GENUINE,
    DEMO_CASE_2_TAMPERED,
    DEMO_CASE_3_FACE_MISMATCH,
  ]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSelectDemoCase = (caseType: 'genuine' | 'tampered' | 'mismatch') => {
    if (caseType === 'genuine') {
      setCurrentCase({ ...DEMO_CASE_1_GENUINE, timestamp: new Date().toISOString() });
    } else if (caseType === 'tampered') {
      setCurrentCase({ ...DEMO_CASE_2_TAMPERED, timestamp: new Date().toISOString() });
    } else {
      setCurrentCase({ ...DEMO_CASE_3_FACE_MISMATCH, timestamp: new Date().toISOString() });
    }
    setActiveView('workflow');
  };

  const handleSaveToAudit = (savedCase: VerificationCase) => {
    setAuditCases((prev) => {
      const existsIndex = prev.findIndex((c) => c.caseId === savedCase.caseId);
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = savedCase;
        return next;
      }
      return [savedCase, ...prev];
    });
    setActiveView('audit');
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-500 relative font-body-custom ${
        isDark ? 'dark-theme bg-[#0b0f19] text-slate-100' : 'bg-[#f4f4f0] text-black'
      } selection:bg-black selection:text-white`}
    >

      {/* Top Navbar */}
      <Navbar
        currentView={activeView}
        onNavigate={(view) => setActiveView(view)}
        theme={theme}
        onToggleTheme={toggleTheme}
        officer={officer}
        onLogout={() => {
          setOfficer(null);
          setActiveView('login');
        }}
      />

      {/* Main View Router */}
      <main className="relative z-10">
        {/* VIEW 1: HERO LANDING (Immediately rendered, zero latency) */}
        {activeView === 'hero' && (
          <HeroSection
            onStartVerification={() => {
              if (officer) setActiveView('dashboard');
              else setActiveView('login');
            }}
            onExploreTech={() => setActiveView('architecture')}
            onSelectDemoCase={handleSelectDemoCase}
            isDark={isDark}
          />
        )}

        {/* Dynamic Views wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-xs font-mono">
              <ScanLine className="w-6 h-6 text-cyan-500 animate-spin" />
              <span className="opacity-70">Loading Aegis Security Module...</span>
            </div>
          }
        >
          {/* VIEW 2: OFFICER LOGIN */}
          {activeView === 'login' && (
            <OfficerLogin
              onLoginSuccess={(authOfficer) => {
                setOfficer(authOfficer);
                setActiveView('dashboard');
              }}
              isDark={isDark}
            />
          )}

          {/* VIEW 3: MAIN OFFICER DASHBOARD */}
          {activeView === 'dashboard' && officer && (
            <MainDashboard
              officer={officer}
              onStartNewVerification={() => setActiveView('workflow')}
              onSelectDemoCase={handleSelectDemoCase}
              onNavigate={(view) => setActiveView(view)}
              isDark={isDark}
            />
          )}

          {/* VIEW 4: VERIFICATION WORKFLOW PIPELINE (MODULES 1 TO 7) */}
          {activeView === 'workflow' && (
            <WorkflowPipeline
              currentCase={currentCase}
              officer={
                officer || {
                  id: 'MHA-GUEST',
                  name: 'Officer Guest',
                  badgeNumber: 'GUEST-01',
                  checkpointLocation: 'Evaluation Terminal',
                  clearanceLevel: 'LEVEL-3',
                }
              }
              onUpdateCase={(updated) => setCurrentCase(updated)}
              onSaveToAudit={handleSaveToAudit}
              onOpenReport={() => setActiveView('audit')}
              isDark={isDark}
            />
          )}

          {/* VIEW 5: DIGITAL AUDIT TRAIL */}
          {activeView === 'audit' && (
            <AuditTrailView
              cases={auditCases}
              onOpenReport={(repCase) => {
                setCurrentCase(repCase);
                setActiveView('workflow');
              }}
              isDark={isDark}
            />
          )}

          {/* VIEW 6: ANALYTICS MODULE */}
          {activeView === 'analytics' && <AnalyticsView isDark={isDark} />}

          {/* VIEW 7: SYSTEM ARCHITECTURE & AI TECHNOLOGY */}
          {activeView === 'architecture' && <ArchitectureView isDark={isDark} />}
        </Suspense>
      </main>
    </div>
  );
}
