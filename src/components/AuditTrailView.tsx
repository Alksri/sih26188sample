import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  FileText,
  Shield,
  X,
  Printer,
  QrCode
} from 'lucide-react';
import { VerificationCase } from '../types/screening';

interface AuditTrailViewProps {
  cases: VerificationCase[];
  onOpenReport?: (c: VerificationCase) => void;
  isDark: boolean;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  cases,
  onOpenReport,
  isDark,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [selectedCaseForModal, setSelectedCaseForModal] = useState<VerificationCase | null>(null);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.extractedData.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.extractedData.passportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.extractedData.visaNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterRisk === 'ALL' || c.riskAssessment.riskLevel === filterRisk;

    return matchesSearch && matchesFilter;
  });

  const handleDownloadDossier = (c: VerificationCase) => {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Verification_Dossier_${c.caseId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="pt-24 pb-16 px-5 sm:px-8 md:px-12 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-mono uppercase tracking-wider opacity-60">
              Module 7 // Immutable Digital Ledger
            </span>
          </div>
          <h1 className="font-heading-custom text-3xl font-bold tracking-tight">
            Digital Investigation & Audit Trail
          </h1>
          <p className="text-xs sm:text-sm opacity-70 mt-1">
            Every screening event is timestamped and cryptographically hashed with SHA-256 for judicial & inter-agency scrutiny.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-full border border-black/10 dark:border-slate-800">
            Records in Ledger: {cases.length}
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Case ID, Name, Passport, Visa..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-mono focus:outline-none transition-colors ${
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-black/15 shadow-sm'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 opacity-60" />
          <span className="text-xs font-mono opacity-60">Risk Filter:</span>
          {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setFilterRisk(r)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                filterRisk === r
                  ? 'bg-black text-white dark:bg-cyan-500 dark:text-black font-bold'
                  : 'bg-black/5 dark:bg-slate-900 hover:opacity-80'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE CARD VIEW (Phones < md) */}
      <div className="md:hidden space-y-3">
        {filteredCases.map((c) => (
          <div
            key={c.caseId}
            className={`p-4 rounded-xl border space-y-2.5 font-mono text-xs shadow-sm ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-black/10'
            }`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-black/5 dark:border-slate-800">
              <span className="font-bold text-cyan-500">{c.caseId}</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  c.riskAssessment.finalDecision === 'VERIFIED'
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : c.riskAssessment.finalDecision === 'REVIEW REQUIRED'
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-red-500/10 text-red-600'
                }`}
              >
                {c.riskAssessment.finalDecision}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-bold">{c.extractedData.fullName}</div>
              <div className="text-[11px] opacity-70">
                {c.documentType} • Passport: {c.extractedData.passportNumber}
              </div>
              <div className="text-[11px] opacity-70">
                Visa: {c.extractedData.visaNumber}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-[11px]">
              <div>
                Risk Score:{' '}
                <strong
                  className={
                    c.riskAssessment.overallScore < 25
                      ? 'text-emerald-500'
                      : c.riskAssessment.overallScore < 60
                      ? 'text-amber-500'
                      : 'text-red-500'
                  }
                >
                  {c.riskAssessment.overallScore}% ({c.riskAssessment.riskLevel})
                </strong>
              </div>
              <div>
                Decision: <strong className="text-emerald-500">{c.officerDecision}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/5 dark:border-slate-800">
              {onOpenReport && (
                <button
                  type="button"
                  onClick={() => onOpenReport(c)}
                  className="px-3 py-1 rounded bg-cyan-500/10 text-cyan-500 text-[11px] font-semibold hover:bg-cyan-500/20"
                >
                  Inspect
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedCaseForModal(c)}
                className="px-3 py-1 rounded border border-black/10 dark:border-slate-700 text-[11px] flex items-center gap-1 hover:bg-black/5"
              >
                <FileText className="w-3.5 h-3.5" /> Report
              </button>
              <button
                type="button"
                onClick={() => handleDownloadDossier(c)}
                className="p-1 rounded border border-black/10 dark:border-slate-700 hover:bg-black/5"
                title="Download JSON"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP AUDIT TABLE (Tablets/Desktops >= md) */}
      <div
        className={`hidden md:block rounded-2xl border overflow-hidden shadow-sm ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-black/10'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-black/10 dark:border-slate-800 bg-black/[0.03] dark:bg-slate-950 uppercase opacity-60 text-[10px]">
                <th className="p-3.5">Case ID</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Subject & Doc</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Officer Decision</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-slate-800/60">
              {filteredCases.map((c) => (
                <tr
                  key={c.caseId}
                  className="hover:bg-black/[0.02] dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3.5 font-bold">
                    <button
                      type="button"
                      onClick={() => setSelectedCaseForModal(c)}
                      className="text-cyan-500 hover:underline cursor-pointer"
                    >
                      {c.caseId}
                    </button>
                  </td>
                  <td className="p-3.5 opacity-70 whitespace-nowrap">
                    {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold">{c.extractedData.fullName}</div>
                    <div className="text-[10px] opacity-60">
                      {c.documentType} • No: {c.extractedData.passportNumber}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`font-bold ${
                        c.riskAssessment.overallScore < 25
                          ? 'text-emerald-500'
                          : c.riskAssessment.overallScore < 60
                          ? 'text-amber-500'
                          : 'text-red-500'
                      }`}
                    >
                      {c.riskAssessment.overallScore}% ({c.riskAssessment.riskLevel})
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.riskAssessment.finalDecision === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : c.riskAssessment.finalDecision === 'REVIEW REQUIRED'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-red-500/10 text-red-600'
                      }`}
                    >
                      {c.riskAssessment.finalDecision}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold">
                    <span
                      className={
                        c.officerDecision === 'APPROVED'
                          ? 'text-emerald-600'
                          : c.officerDecision === 'SECONDARY'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }
                    >
                      {c.officerDecision}
                    </span>
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {onOpenReport && (
                        <button
                          type="button"
                          onClick={() => onOpenReport(c)}
                          className="px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 text-[10px] transition-colors cursor-pointer"
                          title="Inspect Case in Workflow"
                        >
                          Inspect
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedCaseForModal(c)}
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-slate-800 text-cyan-500 transition-colors cursor-pointer"
                        title="View Full Report"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadDossier(c)}
                        className="p-1 rounded hover:bg-black/5 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Download JSON Dossier"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VERIFICATION REPORT MODAL (Specified in requirements Section 18) */}
      {selectedCaseForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`w-full max-w-2xl rounded-2xl border p-6 sm:p-8 shadow-2xl relative my-8 transition-all ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-black/15 text-black'
            }`}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedCaseForModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Report Header */}
            <div className="border-b pb-4 mb-6 text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-mono uppercase tracking-widest opacity-60">
                  REPUBLIC OF INDIA // MINISTRY OF HOME AFFAIRS
                </span>
              </div>
              <h2 className="font-heading-custom text-2xl font-bold tracking-tight">
                AI DOCUMENT VERIFICATION REPORT
              </h2>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-mono opacity-70 pt-1">
                <span>Case ID: {selectedCaseForModal.caseId}</span>
                <span>Date: {new Date(selectedCaseForModal.timestamp).toLocaleDateString()}</span>
                <span>Officer ID: {selectedCaseForModal.officerId}</span>
              </div>
            </div>

            {/* Report Content Body */}
            <div className="space-y-5 text-xs font-mono">
              {/* Identity Information */}
              <div>
                <h4 className="font-heading-custom text-sm font-bold uppercase tracking-wider mb-2 text-blue-500">
                  Identity Information
                </h4>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl border border-black/10 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950">
                  <div>Name: <strong className="font-mono">{selectedCaseForModal.extractedData.fullName}</strong></div>
                  <div>Passport No: <strong>{selectedCaseForModal.extractedData.passportNumber}</strong></div>
                  <div>Nationality: <strong>{selectedCaseForModal.extractedData.nationality}</strong></div>
                  <div>DOB: <strong>{selectedCaseForModal.extractedData.dateOfBirth}</strong></div>
                  <div>Visa No: <strong>{selectedCaseForModal.extractedData.visaNumber}</strong></div>
                  <div>Visa Type: <strong>{selectedCaseForModal.extractedData.visaType}</strong></div>
                  <div>Expiry Date: <strong>{selectedCaseForModal.extractedData.dateOfExpiry}</strong></div>
                  <div>Stay Duration: <strong>{selectedCaseForModal.extractedData.stayDuration}</strong></div>
                </div>
              </div>

              {/* Module Results */}
              <div>
                <h4 className="font-heading-custom text-sm font-bold uppercase tracking-wider mb-2 text-emerald-500">
                  Module Results
                </h4>
                <div className="space-y-1.5">
                  <div className="flex justify-between p-2 rounded border border-black/5 dark:border-slate-800">
                    <span>Information Extraction:</span>
                    <span className="text-emerald-500 font-bold">PASS ({selectedCaseForModal.riskAssessment.extractionConfidenceAvg}%)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded border border-black/5 dark:border-slate-800">
                    <span>Document Validation:</span>
                    <span className={selectedCaseForModal.riskAssessment.documentValidationState === 'PASS' ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                      {selectedCaseForModal.riskAssessment.documentValidationState}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded border border-black/5 dark:border-slate-800">
                    <span>Tampering Detection:</span>
                    <span className={selectedCaseForModal.tamperingResult.overallRisk > 40 ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>
                      {selectedCaseForModal.tamperingResult.overallRisk}% — {selectedCaseForModal.tamperingResult.status}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded border border-black/5 dark:border-slate-800">
                    <span>Face Verification:</span>
                    <span className={selectedCaseForModal.faceVerificationResult.faceMatchScore > 80 ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>
                      {selectedCaseForModal.faceVerificationResult.faceMatchScore}% — {selectedCaseForModal.faceVerificationResult.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Biometric Photo Pair Preview */}
              {(selectedCaseForModal.passportPhotoUrl || selectedCaseForModal.imagePreviewUrl) && (
                <div className="p-3 rounded-xl border border-black/10 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950/60 flex items-center justify-around gap-4 text-center">
                  <div>
                    <div className="text-[9px] uppercase font-mono opacity-60 mb-1 font-semibold">Source A: Passport Photo</div>
                    <img
                      src={selectedCaseForModal.passportPhotoUrl || selectedCaseForModal.imagePreviewUrl}
                      alt="Passport Portrait"
                      className="w-16 h-16 rounded-xl object-cover border-2 border-cyan-500/50 shadow-sm mx-auto"
                    />
                  </div>
                  <div className="text-center font-mono text-xs font-bold text-cyan-500">
                    <div>1:1 MATCH</div>
                    <div className="text-sm">{selectedCaseForModal.faceVerificationResult.faceMatchScore}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-mono opacity-60 mb-1 font-semibold">Source B: Live Gate Capture</div>
                    {selectedCaseForModal.capturedCameraPhotoUrl ? (
                      <img
                        src={selectedCaseForModal.capturedCameraPhotoUrl}
                        alt="Gate Camera Capture"
                        className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500/50 shadow-sm mx-auto"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-mono opacity-50 mx-auto border border-dashed border-slate-600">
                        Preset
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Final Assessment */}
              <div className="p-4 rounded-xl border border-black/10 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase opacity-60">OVERALL RISK LEVEL</div>
                  <div className="text-xl font-bold text-emerald-500">
                    {selectedCaseForModal.riskAssessment.riskLevel} ({selectedCaseForModal.riskAssessment.overallScore}%)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase opacity-60">FINAL DECISION</div>
                  <div className="text-xl font-bold">{selectedCaseForModal.riskAssessment.finalDecision}</div>
                </div>
              </div>

              {/* SHA256 & QR Visual */}
              <div className="pt-3 border-t border-black/10 dark:border-slate-800 flex items-center justify-between text-[10px] opacity-60">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8" />
                  <div>
                    <div>CRYPTOGRAPHIC VERIFICATION SEAL</div>
                    <div className="font-mono">{selectedCaseForModal.sha256Hash}</div>
                  </div>
                </div>
                <div>SECURE RECORD</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-black/10 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 cursor-pointer hover:bg-black/5 dark:hover:bg-slate-800"
              >
                <Printer className="w-3.5 h-3.5" /> Print Report
              </button>
              <button
                type="button"
                onClick={() => handleDownloadDossier(selectedCaseForModal)}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-cyan-500 dark:text-black font-semibold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" /> Download Dossier (.json)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
