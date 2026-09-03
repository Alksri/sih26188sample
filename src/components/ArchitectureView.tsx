import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  FileCheck,
  Eye,
  Fingerprint,
  Activity,
  Shield,
  History,
  Sparkles,
  Camera
} from 'lucide-react';

interface ArchitectureViewProps {
  isDark: boolean;
}

interface ComponentDetail {
  id: string;
  title: string;
  category: string;
  icon: any;
  summary: string;
  inputs: string[];
  outputs: string[];
  techStack: string;
}

const ARCHITECTURE_COMPONENTS: ComponentDetail[] = [
  {
    id: 'sensor',
    title: 'Document & Camera Ingestion',
    category: 'Hardware & Sensor Interface',
    icon: Camera,
    summary: 'Captures ultra-high-resolution multi-spectral imagery (Visible, UV 365nm, Infrared) from e-passports, physical visas, and checkpoint CCTV sensors.',
    inputs: ['Passport physical scan', 'Digital e-Visa PDF', 'Checkpoint IP Camera'],
    outputs: ['Normalized 300DPI TIFF / JPEG', 'Spectral channel separation'],
    techStack: 'OpenCV image rectification, TWAIN flatbed drivers, WebRTC video stream',
  },
  {
    id: 'preprocessing',
    title: 'Image Preprocessing & Rectification',
    category: 'Computer Vision Core',
    icon: Layers,
    summary: 'Performs document boundary contour detection, perspective unwarping, specular glare removal, and illumination normalization.',
    inputs: ['Raw multi-spectral imagery'],
    outputs: ['Perspective-corrected document frame', 'Contrast-enhanced MRZ band'],
    techStack: 'Homography matrix estimation, Bilateral filtering, CLAHE illumination normalization',
  },
  {
    id: 'ocr',
    title: 'OCR & Field Extraction',
    category: 'Optical Intelligence',
    icon: FileCheck,
    summary: 'Converts pixel data into structured JSON intelligence with per-field confidence scores using multimodal transformer OCR.',
    inputs: ['Preprocessed document frame'],
    outputs: ['10 structured fields', 'ICAO Doc 9303 OCR-B glyph matrix'],
    techStack: 'Multimodal Neural Vision, ICAO Doc 9303 parsing engine',
  },
  {
    id: 'validation',
    title: 'Document Validation Engine',
    category: 'Standards & Rules Gate',
    icon: Shield,
    summary: 'Verifies character structures, issuing country mission checksum algorithms, expiration chronology, and logical consistency.',
    inputs: ['Structured field JSON', 'MRZ character stream'],
    outputs: ['Modulo-7 checksum status', 'Format compliance checklist'],
    techStack: 'ICAO Modulo-7 & Modulo-3 check digit validators, MHA master ledger API',
  },
  {
    id: 'tampering',
    title: 'AI Tampering Detection Forensics',
    category: 'Deep Forensics (Core Innovation)',
    icon: Eye,
    summary: 'Performs Error Level Analysis (ELA), edge discontinuity detection for photo substitution, and micro-print font thickness variance analysis.',
    inputs: ['Multi-spectral document image', 'Original compressed stream'],
    outputs: ['Bounding box anomaly coordinates', 'Vector fraud probabilities (0-100%)'],
    techStack: 'JPEG quantization matrix residual analysis, Sobel edge variance, Deep CNN feature extraction',
  },
  {
    id: 'biometrics',
    title: 'Face Verification & Anti-Spoof',
    category: 'Biometric Intelligence',
    icon: Fingerprint,
    summary: 'Compares document photograph with live checkpoint presenter using 68-point facial landmark alignment, 128-d embedding, and 3D liveness detection.',
    inputs: ['Extracted portrait photo', 'Live camera stream snapshot'],
    outputs: ['Cosine similarity percentage', 'Liveness confidence score'],
    techStack: 'Facial landmark regression, FaceNet 128-d embeddings, Micro-vascular liveness tracker',
  },
  {
    id: 'risk',
    title: 'Bayesian Risk Assessment Engine',
    category: 'Decision Fusion Core',
    icon: Activity,
    summary: 'Synthesizes extraction confidence, validation flags, tampering vectors, and biometric similarity into a unified explainable risk score.',
    inputs: ['Validation state', 'Tampering vectors', 'Face match score'],
    outputs: ['Overall Risk Score (0-100%)', 'Classification: LOW / MEDIUM / HIGH'],
    techStack: 'Bayesian belief network, Dynamic threat weighting matrix, Explainable AI inference',
  },
  {
    id: 'audit',
    title: 'Digital Audit Trail & Hash Ledger',
    category: 'Cryptographic Security',
    icon: History,
    summary: 'Generates immutable cryptographic SHA-256 logs for every screening case to guarantee evidentiary integrity and officer accountability.',
    inputs: ['Officer decision', 'Case telemetry JSON', 'Timestamp'],
    outputs: ['SHA-256 digest', 'Signed forensic case dossier'],
    techStack: 'SHA-256 cryptographic hashing, WORM (Write Once Read Many) audit storage',
  },
];

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({ isDark }) => {
  const [selectedCompId, setSelectedCompId] = useState<string>('tampering');

  const activeComp = ARCHITECTURE_COMPONENTS.find((c) => c.id === selectedCompId) || ARCHITECTURE_COMPONENTS[0];

  return (
    <section className="pt-24 pb-16 px-5 sm:px-8 md:px-12 max-w-7xl mx-auto space-y-12">
      {/* Title */}
      <div className="pb-6 border-b border-black/10 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <Cpu className="w-4 h-4 text-cyan-500" />
          <span className="text-xs font-mono uppercase tracking-wider opacity-60">
            System Architecture & Deep Learning Specifications
          </span>
        </div>
        <h1 className="font-heading-custom text-3xl font-bold tracking-tight">
          System Architecture & AI Technology
        </h1>
        <p className="text-xs sm:text-sm opacity-70 mt-1">
          Detailed technical pipeline diagram and explainable AI specifications designed for SIH technical evaluators.
        </p>
      </div>

      {/* SECTION 1: INTERACTIVE ARCHITECTURE PIPELINE */}
      <div className="space-y-6">
        <div>
          <h2 className="font-heading-custom text-xl font-bold tracking-tight">
            End-to-End Intelligence Pipeline
          </h2>
          <p className="text-xs font-mono opacity-60">
            Click any component below to view technical input/output specifications
          </p>
        </div>

        {/* Pipeline horizontal workflow cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {ARCHITECTURE_COMPONENTS.map((comp, idx) => {
            const isSelected = comp.id === selectedCompId;
            const Icon = comp.icon;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelectedCompId(comp.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 group ${
                  isSelected
                    ? isDark
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'border-black bg-black text-white shadow-md'
                    : isDark
                    ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                    : 'border-black/10 bg-white/70 hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold opacity-60">0{idx + 1}</span>
                  <Icon className={`w-4 h-4 ${isSelected ? (isDark ? 'text-cyan-400' : 'text-white') : 'opacity-60'}`} />
                </div>
                <div>
                  <div className="text-xs font-bold font-mono line-clamp-2 leading-tight">
                    {comp.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Component Technical Detail Card */}
        <div
          className={`p-6 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/90 border-black/10 shadow-sm'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-black/10 dark:border-slate-800">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-bold">
                {activeComp.category}
              </span>
              <h3 className="font-heading-custom text-2xl font-bold tracking-tight">
                {activeComp.title}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full border border-black/10 dark:border-slate-700 text-xs font-mono">
              SIH26188 Specification
            </span>
          </div>

          <p className="text-sm leading-relaxed opacity-85 mb-6">
            {activeComp.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl border border-black/5 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950">
              <span className="text-[10px] uppercase opacity-60 block mb-1 font-bold">Input Data Streams:</span>
              <ul className="space-y-1">
                {activeComp.inputs.map((inp, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl border border-black/5 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950">
              <span className="text-[10px] uppercase opacity-60 block mb-1 font-bold">Output Artifacts:</span>
              <ul className="space-y-1">
                {activeComp.outputs.map((out, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl border border-black/5 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950">
              <span className="text-[10px] uppercase opacity-60 block mb-1 font-bold">Underlying Algorithms:</span>
              <p className="text-[11px] leading-relaxed opacity-80">{activeComp.techStack}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: HOW OUR AI WORKS (Specified in requirements Section 20) */}
      <div className="space-y-6 pt-6 border-t border-black/10 dark:border-slate-800">
        <div>
          <h2 className="font-heading-custom text-2xl font-bold tracking-tight">
            How Our AI Works (Core Technologies)
          </h2>
          <p className="text-xs sm:text-sm opacity-70">
            A comprehensive breakdown of the computer vision and neural forensic models deployed in Aegis®.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: OCR */}
          <div
            className={`p-6 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="w-5 h-5 text-blue-500" />
              <h3 className="font-heading-custom text-base font-bold">Optical Character Recognition</h3>
            </div>
            <p className="text-xs leading-relaxed opacity-75">
              Converts complex, skewed, and noisy document images into standardized machine-readable text. It maps multi-lingual characters, resolves ICAO OCR-B font standards, and outputs confidence metrics for every individual character.
            </p>
          </div>

          {/* Card 2: Computer Vision */}
          <div
            className={`p-6 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-purple-500" />
              <h3 className="font-heading-custom text-base font-bold">Computer Vision Analysis</h3>
            </div>
            <p className="text-xs leading-relaxed opacity-75">
              Analyzes micro-level document structures, multi-layered guilloche backgrounds, holographic security threads, and geometrical alignment. Detects misalignment as small as 0.2 millimeters.
            </p>
          </div>

          {/* Card 3: Image Forensics */}
          <div
            className={`p-6 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-red-500" />
              <h3 className="font-heading-custom text-base font-bold">Image Forensics & ELA</h3>
            </div>
            <p className="text-xs leading-relaxed opacity-75">
              Evaluates compression error levels across the image matrix to uncover digital photo substitution, cloned pixels, stamp splicing, and altered font weights that remain invisible to the naked human eye.
            </p>
          </div>

          {/* Card 4: Face Recognition */}
          <div
            className={`p-6 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Fingerprint className="w-5 h-5 text-cyan-500" />
              <h3 className="font-heading-custom text-base font-bold">Face Recognition & Liveness</h3>
            </div>
            <p className="text-xs leading-relaxed opacity-75">
              Generates invariant 128-dimensional facial embeddings to calculate cosine similarity between the document portrait and the presenter, while active 3D anti-spoofing neutralizes deepfakes and print attacks.
            </p>
          </div>

          {/* Card 5: Risk Engine */}
          <div
            className={`p-6 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-amber-500" />
              <h3 className="font-heading-custom text-base font-bold">Bayesian Risk Fusion Engine</h3>
            </div>
            <p className="text-xs leading-relaxed opacity-75">
              Fuses disparate forensic signals (optical integrity, MRZ checksum, tamper probability, facial cosine distance) into a standardized 0-100% fraud probability index calibrated against historical border intelligence.
            </p>
          </div>

          {/* Card 6: Explainable AI */}
          <div
            className={`p-6 rounded-2xl border space-y-2 ${
              isDark ? 'bg-slate-900/70 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className="font-heading-custom text-base font-bold">Explainable AI (XAI)</h3>
            </div>
            <p className="text-xs leading-relaxed opacity-75">
              Eliminates "black box" decisions by generating actionable natural language rationales and visual bounding boxes that empower border officers to justify interdictions legally and objectively.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
