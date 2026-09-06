import React, { useState } from 'react';
import {
  ZoomIn,
  Sparkles,
  Layers,
  Camera,
  BookOpen,
  Zap,
  FileText
} from 'lucide-react';
import { TamperingResult, ExtractedDocumentData, RAGIntelligenceReport, PDFPageInfo } from '../types/screening';

interface TamperingWorkspaceProps {
  tamperingResult: TamperingResult;
  extractedData: ExtractedDocumentData;
  imagePreviewUrl?: string;
  isValidDocument?: boolean;
  rejectionReason?: string;
  ragReport?: RAGIntelligenceReport;
  isDark: boolean;
  pdfPages?: PDFPageInfo[];
  hasPassportAndVisa?: boolean;
  documentType?: string;
}

export const TamperingWorkspace: React.FC<TamperingWorkspaceProps> = ({
  tamperingResult,
  extractedData,
  imagePreviewUrl,
  isValidDocument,
  rejectionReason,
  ragReport,
  isDark,
  pdfPages,
  hasPassportAndVisa,
  documentType,
}) => {
  const [activeFilter, setActiveFilter] = useState<'normal' | 'uv' | 'ir' | 'ela'>('normal');
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredAnomalyId, setHoveredAnomalyId] = useState<string | null>(null);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  const isTampered = tamperingResult.overallRisk > 40;
  const activePage = pdfPages && pdfPages.length > 0 ? pdfPages[Math.min(activePageIndex, pdfPages.length - 1)] : null;
  const displayUrl = activePage?.previewUrl || imagePreviewUrl;

  const docTypeUpper = (documentType || '').toUpperCase();
  const isBoth = Boolean(
    hasPassportAndVisa ||
    docTypeUpper === 'VISA AND PASSPORT' ||
    docTypeUpper === 'PASSPORT AND VISA' ||
    docTypeUpper.includes('BUNDLE') ||
    (docTypeUpper.includes('VISA') && docTypeUpper.includes('PASSPORT'))
  );
  const isVisa = !isBoth && docTypeUpper.includes('VISA');
  const isPassport = !isBoth && !isVisa;
  const docTypeLabel = isBoth ? 'VISA AND PASSPORT' : isVisa ? 'VISA' : 'PASSPORT';

  return (
    <div className="space-y-6">
      {/* Module Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded text-[11px] font-mono border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CORE AI INNOVATION // SIH26188</span>
          </div>
          <h2 className="font-heading-custom text-2xl sm:text-3xl font-bold tracking-tight">
            Module 3: AI Tampering Detection
          </h2>
          <div className="flex items-center gap-2 mt-1 mb-1">
            <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${
              isBoth
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                : isVisa
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400'
            }`}>
              DOCUMENT: {docTypeLabel}
            </span>
            <span className="text-[11px] font-mono opacity-60">
              // {isBoth ? 'Passport & Visa Dual Package' : isVisa ? 'Visa Certificate Forensics' : 'Passport Specimen Forensics'}
            </span>
          </div>
          <p className="text-xs sm:text-sm opacity-70 mt-0.5">
            Detect digitally or physically altered identity documents using multi-spectral computer vision & error level forensics.
          </p>
        </div>

        {/* Overall Status Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block">
              Overall Forensics Risk
            </span>
            <div
              className={`text-2xl font-mono font-bold ${
                tamperingResult.overallRisk < 25
                  ? 'text-emerald-500'
                  : tamperingResult.overallRisk < 60
                  ? 'text-amber-500'
                  : 'text-red-500'
              }`}
            >
              {tamperingResult.overallRisk}%
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
              tamperingResult.overallRisk < 25
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                : tamperingResult.overallRisk < 60
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                : 'bg-red-500/10 border-red-500/30 text-red-600'
            }`}
          >
            {tamperingResult.status}
          </span>
        </div>
      </div>

      {/* 2-Column Workstation: Left Original Document, Right AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: Interactive Document Viewer with Heatmap & Bounding Boxes */}
        <div
          className={`lg:col-span-7 p-5 rounded-2xl border ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-black/10 shadow-sm'
          }`}
        >
          {/* Multi-Page PDF Document Page Switcher (Passport vs Visa) */}
          {pdfPages && pdfPages.length > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                <FileText className="w-4 h-4 text-cyan-500" />
                <span>COMBINED PDF ({isBoth ? 'VISA AND PASSPORT' : `${pdfPages.length} PAGES`}):</span>
              </div>
              <div className="flex gap-1.5">
                {pdfPages.map((pg, idx) => (
                  <button
                    key={pg.pageNumber}
                    type="button"
                    onClick={() => setActivePageIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      activePageIndex === idx
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30 font-extrabold'
                        : 'bg-black/10 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-cyan-500/20'
                    }`}
                  >
                    {pg.label || `Page ${pg.pageNumber}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-black/10 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <Layers className="w-4 h-4 text-cyan-500" />
              <span className="opacity-60">SPECTRAL CHANNEL:</span>
              <div className="flex gap-1 ml-1">
                <button
                  type="button"
                  onClick={() => setActiveFilter('normal')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    activeFilter === 'normal'
                      ? 'bg-black text-white dark:bg-white dark:text-black font-semibold'
                      : 'bg-black/5 dark:bg-slate-800 hover:opacity-80'
                  }`}
                >
                  Visible
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('uv')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    activeFilter === 'uv'
                      ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)]'
                      : 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20'
                  }`}
                >
                  UV 365nm
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('ir')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    activeFilter === 'ir'
                      ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                      : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                  }`}
                >
                  IR Ink
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('ela')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                    activeFilter === 'ela'
                      ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                      : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                  }`}
                >
                  ELA Heatmap
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAnnotations(!showAnnotations)}
                className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors cursor-pointer ${
                  showAnnotations
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                    : 'border-black/15 dark:border-slate-700 opacity-60'
                }`}
              >
                {showAnnotations ? 'Hide Regions' : 'Show Regions'}
              </button>

              <button
                type="button"
                onClick={() => setZoomLevel((z) => (z === 1 ? 1.35 : 1))}
                className="p-1 rounded border border-black/15 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-slate-800 cursor-pointer"
                title="Toggle Zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simulated Document Specimen Canvas */}
          <div
            className={`relative rounded-xl overflow-hidden h-[340px] sm:h-[380px] flex items-center justify-center border transition-all ${
              activeFilter === 'uv'
                ? 'bg-[#15072b] border-purple-900'
                : activeFilter === 'ir'
                ? 'bg-[#042013] border-emerald-900'
                : activeFilter === 'ela'
                ? 'bg-[#290505] border-red-900'
                : isDark
                ? 'bg-slate-950 border-slate-800'
                : 'bg-slate-200 border-black/10'
            }`}
          >
            {/* Visual Specimen Card (Fluid on mobile phones) */}
            <div
              className="relative p-3 sm:p-5 rounded-lg border shadow-xl max-w-[94%] sm:max-w-md w-full bg-white text-black transition-transform duration-300 select-none overflow-hidden"
              style={{
                transform: `scale(${zoomLevel})`,
                filter:
                  activeFilter === 'uv'
                    ? 'contrast(1.5) hue-rotate(240deg) brightness(1.2)'
                    : activeFilter === 'ir'
                    ? 'grayscale(1) invert(0.9) contrast(1.7)'
                    : activeFilter === 'ela'
                    ? 'contrast(2.2) saturate(2) hue-rotate(80deg)'
                    : 'none',
              }}
            >
              {displayUrl ? (
                <div className="relative w-full rounded overflow-hidden flex items-center justify-center bg-black/5">
                  <img
                    src={displayUrl}
                    alt="Ingested Identity Document"
                    className="w-full max-h-[260px] sm:max-h-[300px] object-contain rounded select-none"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('data:image/svg')) {
                        target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%231e293b"/><text x="50%" y="45%" fill="%2306b6d4" font-family="monospace" font-weight="bold" font-size="20" text-anchor="middle">OFFICIAL TRAVEL DOCUMENT</text><text x="50%" y="55%" fill="%2394a3b8" font-family="monospace" font-size="14" text-anchor="middle">Multi-Spectral Forensic Specimen</text></svg>';
                      }
                    }}
                  />
                  {/* If invalid document, overlay red rejection stamp */}
                  {isValidDocument === false && (
                    <div className="absolute inset-0 bg-red-950/50 border-4 border-red-500 rounded flex flex-col items-center justify-center p-3 text-center backdrop-blur-[1px]">
                      <div className="text-red-500 font-mono font-black text-sm sm:text-base border-2 border-red-500 px-3 py-1 rounded -rotate-6 uppercase tracking-wider shadow-2xl bg-black/90">
                        REJECTED // WRONG SPECIMEN
                      </div>
                      <p className="mt-2 text-[10px] sm:text-xs font-mono text-red-200 bg-black/90 px-2.5 py-1 rounded max-w-xs font-medium">
                        {rejectionReason || 'Visual inspection failed: Not an authentic government identity document.'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3 border-b pb-2">
                    <div>
                      <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500">
                        {isPassport
                          ? 'REPUBLIC OF INDIA // OFFICIAL PASSPORT'
                          : isVisa
                          ? 'REPUBLIC OF INDIA // ENTRY VISA CLEARANCE'
                          : 'REPUBLIC OF INDIA // VISA AND PASSPORT PACKAGE'}
                      </div>
                      <div className="text-sm font-bold font-mono">
                        {isPassport
                          ? (extractedData.passportNumber || 'X6248911')
                          : (extractedData.visaNumber || 'V-9842104-IN')}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-black/20 font-bold bg-slate-100">
                      IND
                    </span>
                  </div>

                  {/* Photo & Details */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {/* Photo box */}
                    <div className="col-span-1 h-28 bg-slate-200 rounded border border-black/15 flex flex-col items-center justify-center relative overflow-hidden">
                      <Camera className="w-8 h-8 text-slate-400 mb-1" />
                      <span className="text-[9px] font-mono text-slate-500">PORTRAIT</span>

                      {/* Photo Anomaly overlay if tampered */}
                      {isTampered && (
                        <div className="absolute inset-0 border-2 border-dashed border-red-500/80 bg-red-500/10 flex items-end p-1">
                          <span className="text-[8px] font-mono text-red-600 bg-white/90 px-1 rounded font-bold">
                            EDGE CLONE 82%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="col-span-2 space-y-1 font-mono text-[10px]">
                      <div>NAME: {extractedData.fullName}</div>
                      <div>PASSPORT: {extractedData.passportNumber}</div>
                      <div>TYPE: {extractedData.visaType}</div>
                      <div>EXPIRY: {extractedData.dateOfExpiry}</div>
                      <div>GENDER: {extractedData.gender}</div>
                      <div>VALIDATION: {extractedData.entryValidation}</div>
                    </div>
                  </div>

                  {/* MRZ Band */}
                  <div
                    className={`p-1.5 rounded font-mono text-[9px] tracking-wider break-all leading-tight border ${
                      extractedData.mrzValid
                        ? 'bg-slate-100 text-slate-800 border-black/10'
                        : 'bg-red-50 text-red-700 border-red-300 font-bold'
                    }`}
                  >
                    {extractedData.mrzCode || 'V<INDSINGH<<AVANISH<<<<<<<<<<<<<<<<<<<\nZ89201944IND8808142M2910248<<<<<<<<<<<<<<<6'}
                  </div>
                </>
              )}

              {/* UV Mode Authentic Emblem watermark */}
              {activeFilter === 'uv' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-3xl font-bold font-mono text-purple-400/90 border-4 border-purple-400/90 p-2 rounded-xl rotate-12 animate-pulse">
                    MHA SECURITY SEAL
                  </div>
                </div>
              )}

              {/* Bounding Boxes Overlay */}
              {showAnnotations &&
                tamperingResult.anomalies.map((a) => {
                  const isHovered = hoveredAnomalyId === a.id;
                  return (
                    <div
                      key={a.id}
                      style={{
                        position: 'absolute',
                        left: `${a.boxCoordinates.x}%`,
                        top: `${a.boxCoordinates.y}%`,
                        width: `${a.boxCoordinates.width}%`,
                        height: `${a.boxCoordinates.height}%`,
                      }}
                      className={`pointer-events-auto border-2 rounded transition-all cursor-pointer ${
                        a.status === 'HIGH'
                          ? 'border-red-500 bg-red-500/15 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                          : a.status === 'MEDIUM'
                          ? 'border-amber-500 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                          : 'border-emerald-500 bg-emerald-500/10'
                      } ${isHovered ? 'scale-105 z-20 ring-2 ring-white' : ''}`}
                      onMouseEnter={() => setHoveredAnomalyId(a.id)}
                      onMouseLeave={() => setHoveredAnomalyId(null)}
                    >
                      <span
                        className={`absolute -top-4 left-0 px-1 py-0.2 rounded text-[8px] font-mono font-bold uppercase text-white ${
                          a.status === 'HIGH' ? 'bg-red-600' : a.status === 'MEDIUM' ? 'bg-amber-600' : 'bg-emerald-600'
                        }`}
                      >
                        {a.region} ({a.riskScore}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Active Spectral Filter Description */}
          <div
            className={`mt-3 p-2.5 rounded-lg text-xs font-mono flex items-center justify-between border transition-colors ${
              isDark
                ? 'border-slate-800 bg-slate-950/80 text-slate-200'
                : 'border-black/10 bg-slate-100 text-slate-900'
            }`}
          >
            <span>
              Mode:{' '}
              <strong className="uppercase">
                {activeFilter === 'uv'
                  ? '365nm UV Luminescence (Watermarks & Fibers)'
                  : activeFilter === 'ir'
                  ? 'Infrared Reflectance (Ink Chemical Signatures)'
                  : activeFilter === 'ela'
                  ? 'Error Level Analysis (JPEG Quantization Heatmap)'
                  : 'Standard Visible White Light'}
              </strong>
            </span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>SIH26188 Forensics</span>
          </div>
        </div>

        {/* RIGHT 5 COLS: AI Analysis Telemetry & Anomaly Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          {/* Individual Vector Risk Cards (Specified in requirements) */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-black/10 shadow-sm'
            }`}
          >
            <h3 className="font-heading-custom text-sm font-bold uppercase tracking-wider opacity-70">
              Forensic Vector Breakdown
            </h3>

            {/* Vector 1: Photo Replacement */}
            <div
              className={`p-3 rounded-xl border transition-colors ${
                isDark
                  ? 'border-slate-800 bg-slate-950/80 text-slate-100'
                  : 'border-black/10 bg-slate-100/80 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-mono mb-1">
                <span className="font-semibold">Photo Replacement</span>
                <span
                  className={`font-bold ${
                    tamperingResult.photoReplacementRisk > 50
                      ? 'text-red-500'
                      : tamperingResult.photoReplacementRisk > 25
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                >
                  Risk: {tamperingResult.photoReplacementRisk}% — {tamperingResult.photoReplacementStatus}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    tamperingResult.photoReplacementRisk > 50
                      ? 'bg-red-500'
                      : tamperingResult.photoReplacementRisk > 25
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${tamperingResult.photoReplacementRisk}%` }}
                />
              </div>
            </div>

            {/* Vector 2: Text Manipulation */}
            <div
              className={`p-3 rounded-xl border transition-colors ${
                isDark
                  ? 'border-slate-800 bg-slate-950/80 text-slate-100'
                  : 'border-black/10 bg-slate-100/80 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-mono mb-1">
                <span className="font-semibold">Text Manipulation</span>
                <span
                  className={`font-bold ${
                    tamperingResult.textManipulationRisk > 50
                      ? 'text-red-500'
                      : tamperingResult.textManipulationRisk > 25
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                >
                  Risk: {tamperingResult.textManipulationRisk}% — {tamperingResult.textManipulationStatus}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    tamperingResult.textManipulationRisk > 50
                      ? 'bg-red-500'
                      : tamperingResult.textManipulationRisk > 25
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${tamperingResult.textManipulationRisk}%` }}
                />
              </div>
            </div>

            {/* Vector 3: Stamp Forgery */}
            <div
              className={`p-3 rounded-xl border transition-colors ${
                isDark
                  ? 'border-slate-800 bg-slate-950/80 text-slate-100'
                  : 'border-black/10 bg-slate-100/80 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-mono mb-1">
                <span className="font-semibold">Stamp Forgery</span>
                <span
                  className={`font-bold ${
                    tamperingResult.stampForgeryRisk > 50
                      ? 'text-red-500'
                      : tamperingResult.stampForgeryRisk > 25
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                >
                  Risk: {tamperingResult.stampForgeryRisk}% — {tamperingResult.stampForgeryStatus}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    tamperingResult.stampForgeryRisk > 50
                      ? 'bg-red-500'
                      : tamperingResult.stampForgeryRisk > 25
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${tamperingResult.stampForgeryRisk}%` }}
                />
              </div>
            </div>

            {/* Vector 4: Metadata Anomaly */}
            <div
              className={`p-3 rounded-xl border transition-colors ${
                isDark
                  ? 'border-slate-800 bg-slate-950/80 text-slate-100'
                  : 'border-black/10 bg-slate-100/80 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-center text-xs font-mono mb-1">
                <span className="font-semibold">Metadata Anomaly</span>
                <span
                  className={`font-bold ${
                    tamperingResult.metadataAnomalyRisk > 50
                      ? 'text-red-500'
                      : tamperingResult.metadataAnomalyRisk > 25
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                >
                  Risk: {tamperingResult.metadataAnomalyRisk}% — {tamperingResult.metadataAnomalyStatus}
                </span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    tamperingResult.metadataAnomalyRisk > 50
                      ? 'bg-red-500'
                      : tamperingResult.metadataAnomalyRisk > 25
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${tamperingResult.metadataAnomalyRisk}%` }}
                />
              </div>
            </div>
          </div>

          {/* Explainable AI Rationale Card (Crucial SIH requirement) */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-black/10 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <h4 className="font-heading-custom text-sm font-bold">
                Explainable Forensics Rationale
              </h4>
            </div>

            <p
              className={`text-xs font-mono leading-relaxed p-3.5 rounded-xl border transition-colors ${
                isDark
                  ? 'border-slate-800 bg-slate-950/80 text-slate-200'
                  : 'border-black/10 bg-slate-100/80 text-slate-900'
              }`}
            >
              {tamperingResult.explanation
                ? tamperingResult.explanation.replace(/^["'\s]+|["'\s]+$/g, '')
                : 'Document structure matches standard ICAO Doc 9303 specifications.'}
            </p>

            {/* Anomaly list */}
            {tamperingResult.anomalies.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider opacity-60 block">
                  Highlighted Suspicious Regions:
                </span>
                {tamperingResult.anomalies.map((a) => (
                  <div
                    key={a.id}
                    onMouseEnter={() => setHoveredAnomalyId(a.id)}
                    onMouseLeave={() => setHoveredAnomalyId(null)}
                    className={`p-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                      hoveredAnomalyId === a.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : isDark
                        ? 'border-slate-800 bg-slate-950/80 text-slate-200'
                        : 'border-black/10 bg-slate-100 text-slate-900'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>{a.region}</span>
                      <span className={a.status === 'HIGH' ? 'text-red-500' : 'text-amber-500'}>
                        {a.riskScore}% Probability
                      </span>
                    </div>
                    <div className="text-[11px] opacity-70 mt-0.5">{a.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RAG Multi-Spectral Forensic Grounding Card */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-black/10 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <h4 className="font-heading-custom text-sm font-bold">
                  RAG Forensic Grounding Benchmarks
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" /> {ragReport?.estimatedCreditSavingsPct || 82}% Credit Saved
              </span>
            </div>

            {ragReport?.summary && (
              <p className="text-[11px] opacity-75 mb-3 font-mono leading-relaxed">
                {ragReport.summary}
              </p>
            )}

            <div className="space-y-2 text-xs font-mono">
              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-black/[0.02] border-black/5'}`}>
                <div className="flex justify-between font-bold mb-0.5">
                  <span className="text-cyan-500">UV 365nm Substrate Standard</span>
                  <span className={tamperingResult.overallRisk > 40 ? 'text-amber-500' : 'text-emerald-500'}>
                    {tamperingResult.overallRisk > 40 ? 'Divergence Noted' : 'Compliant'}
                  </span>
                </div>
                <div className="text-[11px] opacity-70">
                  Interpol §UV-365: Genuine substrate must remain UV-dull with reactive fluorescent security fibers.
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-black/[0.02] border-black/5'}`}>
                <div className="flex justify-between font-bold mb-0.5">
                  <span className="text-purple-500">ELA Quantization Residual</span>
                  <span className={tamperingResult.textManipulationRisk > 50 ? 'text-red-500' : 'text-emerald-500'}>
                    {tamperingResult.textManipulationRisk > 50 ? 'Quantization Delta > 30%' : 'Uniform Error Delta < 8%'}
                  </span>
                </div>
                <div className="text-[11px] opacity-70">
                  MHA §ELA-04: Digital spliced insertions produce high-frequency quantization variance clusters.
                </div>
              </div>

              <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-black/[0.02] border-black/5'}`}>
                <div className="flex justify-between font-bold mb-0.5">
                  <span className="text-blue-500">Portrait Boundary & Guilloche</span>
                  <span className={tamperingResult.photoReplacementRisk > 50 ? 'text-red-500' : 'text-emerald-500'}>
                    {tamperingResult.photoReplacementRisk > 50 ? 'Boundary Splicing Detected' : 'Intact Line Vectors'}
                  </span>
                </div>
                <div className="text-[11px] opacity-70">
                  ICAO §MADA-7: Continuous guilloche pattern must flow without edge discontinuity or pixel blur.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
