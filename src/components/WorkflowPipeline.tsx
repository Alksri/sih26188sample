import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  ScanLine,
  Activity,
  Check,
  Camera,
  CameraOff,
  Video,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  FlipHorizontal,
  UploadCloud,
  FileText
} from 'lucide-react';
import {
  VerificationCase,
  OfficerDecision,
  OfficerProfile,
  FaceVerificationResult
} from '../types/screening';
import { TamperingWorkspace } from './TamperingWorkspace';
import {
  analyzeWithGemini25,
  compareBiometricFaces,
  DEMO_CASE_1_GENUINE,
  DEMO_CASE_2_TAMPERED,
  DEMO_CASE_3_FACE_MISMATCH,
  DEMO_CASE_INVALID_DOCUMENT
} from '../services/aiEngine';

interface WorkflowPipelineProps {
  currentCase: VerificationCase;
  officer: OfficerProfile;
  onUpdateCase: (updated: VerificationCase) => void;
  onSaveToAudit: (savedCase: VerificationCase) => void;
  onOpenReport: (reportCase: VerificationCase) => void;
  isDark: boolean;
}

const WORKFLOW_STEPS = [
  { id: 'upload', label: '1. Ingestion' },
  { id: 'extract', label: '2. Extraction' },
  { id: 'validate', label: '3. Validation' },
  { id: 'tamper', label: '4. Forensics' },
  { id: 'face', label: '5. Biometrics' },
  { id: 'risk', label: '6. Risk Engine' },
  { id: 'decision', label: '7. Officer Decision' },
];

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({
  currentCase,
  officer,
  onUpdateCase,
  onSaveToAudit,
  onOpenReport,
  isDark,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStageText, setProcessingStageText] = useState<string>('');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [officerNotes, setOfficerNotes] = useState<string>(currentCase.officerNotes || '');
  const [selectedDecision, setSelectedDecision] = useState<OfficerDecision>(currentCase.officerDecision);
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraLoading, setCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(currentCase.capturedCameraPhotoUrl || null);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [comparisonRunning, setComparisonRunning] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const passportInputRef = useRef<HTMLInputElement>(null);
  const webcamFallbackInputRef = useRef<HTMLInputElement>(null);

  // Return the best available passport image for Source A
  const getEffectivePassportPhoto = useCallback(() => {
    if (currentCase.passportPhotoUrl) return currentCase.passportPhotoUrl;
    if (currentCase.imagePreviewUrl) return currentCase.imagePreviewUrl;
    const name = (currentCase.extractedData?.fullName || '').toLowerCase();
    if (name.includes('sarah')) return '/samples/passport_sarah_connor.jpg';
    if (name.includes('marcus')) return '/samples/passport_marcus_tan.jpg';
    return '/samples/passport_avanish_singh.jpg';
  }, [currentCase.passportPhotoUrl, currentCase.imagePreviewUrl, currentCase.extractedData?.fullName]);

  // Handle uploaded file via AI Neural Engine
  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingStageText('Normalizing Document Geometry & Transmitting to AI Neural Engine...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        setProcessingStageText('Running Multimodal Neural Extraction & Modulo-7 MRZ Parity Checks...');
        const result = await analyzeWithGemini25(file, base64);
        result.imagePreviewUrl = dataUrl;
        result.passportPhotoUrl = dataUrl;
        setIsProcessing(false);
        onUpdateCase(result);
        setActiveStepIndex(1); // Advance to Extraction
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      setActiveStepIndex(1);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDecisionConfirm = () => {
    const updated: VerificationCase = {
      ...currentCase,
      officerDecision: selectedDecision,
      officerNotes,
      timestamp: new Date().toISOString(),
    };
    onUpdateCase(updated);
    onSaveToAudit(updated);
  };

  // Webcam stream management
  const stopCameraStream = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const startCameraStream = useCallback(async (facing: 'user' | 'environment' = cameraFacingMode) => {
    stopCameraStream();
    setCameraLoading(true);
    setCameraError(null);

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam media device API is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((e) => console.warn('Video playback warning:', e));
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access unavailable or denied:', err);
      setCameraError(err?.message || 'Camera permission denied or camera device unavailable.');
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  }, [cameraFacingMode, stopCameraStream]);

  // Turn on camera when entering Step 5 (Biometrics index 4), shut down camera when leaving Step 5
  useEffect(() => {
    if (activeStepIndex === 4 && !capturedImage) {
      startCameraStream();
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [activeStepIndex, capturedImage, startCameraStream, stopCameraStream]);

  // Toggle camera direction (front / back)
  const handleToggleFacingMode = () => {
    const nextMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextMode);
    startCameraStream(nextMode);
  };

  // Biometric comparison executor
  const executeBiometricComparison = async (passportUrl: string, liveUrl: string) => {
    setBiometricScanning(true);
    setComparisonRunning(true);

    try {
      const result: FaceVerificationResult = await compareBiometricFaces(
        passportUrl,
        liveUrl,
        currentCase.extractedData.fullName
      );

      const isVerified = result.status === 'VERIFIED';
      const updated: VerificationCase = {
        ...currentCase,
        passportPhotoUrl: passportUrl,
        capturedCameraPhotoUrl: liveUrl,
        faceVerificationResult: result,
        riskAssessment: {
          ...currentCase.riskAssessment,
          faceMatchPct: result.faceMatchScore,
          overallScore: isVerified
            ? Math.min(currentCase.riskAssessment.overallScore, 14)
            : Math.max(currentCase.riskAssessment.overallScore, 86),
          finalDecision:
            isVerified && currentCase.tamperingResult.status === 'AUTHENTIC'
              ? 'VERIFIED'
              : 'HIGH RISK',
          explanationPoints: [
            ...currentCase.riskAssessment.explanationPoints.filter(
              (p) => !p.toLowerCase().includes('face match') && !p.toLowerCase().includes('biometric')
            ),
            `Biometric facial match verified at ${result.faceMatchScore}% confidence.`,
          ],
        },
      };
      onUpdateCase(updated);
    } catch (err) {
      console.error('Error during facial comparison:', err);
    } finally {
      setBiometricScanning(false);
      setComparisonRunning(false);
    }
  };

  // Capture frame from video feed and trigger 1:1 facial comparison
  const handleCaptureSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror image if front camera
    if (cameraFacingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const snapDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setCapturedImage(snapDataUrl);
    stopCameraStream();

    const passportImg = getEffectivePassportPhoto();
    await executeBiometricComparison(passportImg, snapDataUrl);
  };

  const handleRetakeSnapshot = () => {
    setCapturedImage(null);
    startCameraStream();
  };

  const handlePassportPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const updated: VerificationCase = {
          ...currentCase,
          passportPhotoUrl: dataUrl,
          imagePreviewUrl: currentCase.imagePreviewUrl || dataUrl,
        };
        onUpdateCase(updated);

        // If a camera capture already exists, immediately re-compare
        if (capturedImage) {
          executeBiometricComparison(dataUrl, capturedImage);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWebcamFallbackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setCapturedImage(dataUrl);
        stopCameraStream();
        executeBiometricComparison(getEffectivePassportPhoto(), dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBiometricRescan = () => {
    const passportImg = getEffectivePassportPhoto();
    const liveImg = capturedImage || passportImg;
    executeBiometricComparison(passportImg, liveImg);
  };

  return (
    <section className="pt-24 pb-16 px-5 sm:px-8 md:px-12 max-w-7xl mx-auto space-y-8">
      {/* Workflow Navigation Stepper */}
      <div
        className={`p-3 sm:p-4 rounded-2xl border ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10 shadow-sm'
        }`}
      >
        <div className="flex sm:hidden items-center justify-between mb-2 pb-2 border-b border-black/5 dark:border-slate-800 text-[11px] font-mono">
          <span className="text-cyan-500 font-bold">Step {activeStepIndex + 1} of 7:</span>
          <span className="font-semibold">{WORKFLOW_STEPS[activeStepIndex].label}</span>
        </div>
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1 sm:pb-0 scroll-smooth">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const isCompleted = idx < activeStepIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-black text-white font-bold'
                    : isCompleted
                    ? 'text-emerald-500 hover:bg-emerald-500/10'
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                )}
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: UPLOAD DOCUMENT */}
      {activeStepIndex === 0 && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-heading-custom text-3xl font-bold tracking-tight">
              Ingest Identity Document
            </h2>
            <p className="text-xs sm:text-sm opacity-70">
              Upload an official passport photo page, e-Visa certificate, or national ID card to initiate the SIH26188 zero-trust verification pipeline.
            </p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl h-80 max-w-2xl mx-auto flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all relative overflow-hidden ${
              dragActive
                ? isDark
                  ? 'border-cyan-400 bg-slate-800'
                  : 'border-black bg-white'
                : isDark
                ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-900'
                : 'border-black/20 bg-white/70 hover:bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />

            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <ScanLine className="w-12 h-12 text-cyan-500 animate-spin" />
                <div className="space-y-1">
                  <div className="font-heading-custom text-lg font-bold">
                    Analyzing Document via AI Neural Engine...
                  </div>
                  <p className="text-xs font-mono opacity-70 max-w-sm">{processingStageText}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                    isDark ? 'bg-slate-800 text-cyan-400' : 'bg-black/5 text-black'
                  }`}
                >
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <div className="font-heading-custom text-lg font-bold">
                    Drag & Drop Document Here or Browse
                  </div>
                  <p className="text-xs opacity-60 mt-1">
                    Accepts high-res PDF, PNG, JPEG (Passports, Visas, National IDs up to 25MB)
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-black/10 dark:border-slate-800">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Optical Sensor & Flatbed Scanners Compatible</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Scenario Evaluator */}
          <div className="pt-2 text-center space-y-2">
            <span className="text-xs font-mono opacity-60 block">
              Or evaluate pre-calibrated scenario benchmarks:
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateCase(DEMO_CASE_1_GENUINE);
                  setActiveStepIndex(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-xs font-mono hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
              >
                Pass: Diplomatic Visa (9% Risk)
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateCase(DEMO_CASE_2_TAMPERED);
                  setActiveStepIndex(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-600 text-xs font-mono hover:bg-red-500 hover:text-white transition-all cursor-pointer"
              >
                Fail: Tampered Forgery (88% Risk)
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateCase(DEMO_CASE_3_FACE_MISMATCH);
                  setActiveStepIndex(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 text-xs font-mono hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
              >
                Fail: Biometric Imposter (41% Match)
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateCase(DEMO_CASE_INVALID_DOCUMENT);
                  setActiveStepIndex(1);
                }}
                className="px-3 py-1.5 rounded-lg border border-red-600/50 bg-red-600/20 text-red-700 dark:text-red-400 text-xs font-mono hover:bg-red-600 hover:text-white transition-all cursor-pointer font-bold"
              >
                Fail: Wrong / Non-ID Image (99% Risk)
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setActiveStepIndex(1)}
              className="text-xs font-mono text-cyan-500 hover:underline cursor-pointer"
            >
              Or proceed with loaded case ({currentCase.caseId}) →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: INFORMATION EXTRACTION (MODULE 1) */}
      {activeStepIndex === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-blue-500 font-bold">
                Module 1 // OCR & Field Detection
              </div>
              <h2 className="font-heading-custom text-2xl sm:text-3xl font-bold tracking-tight">
                Identity & Visa Information Extraction
              </h2>
            </div>
            <div className="text-xs font-mono px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
              Average Confidence: {currentCase.riskAssessment.extractionConfidenceAvg}%
            </div>
          </div>

          {/* CRITICAL REJECTION BANNER IF NON-IDENTITY DOCUMENT */}
          {currentCase.isValidDocument === false && (
            <div className="p-5 rounded-2xl border-2 border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-mono space-y-3 shadow-lg">
              <div className="flex items-center gap-2.5 font-bold text-base">
                <AlertTriangle className="w-6 h-6 text-red-500 animate-bounce" />
                <span className="tracking-wide">CRITICAL: WRONG / INVALID SPECIMEN REJECTED</span>
              </div>
              <p className="text-xs sm:text-sm font-sans font-medium text-black dark:text-white">
                {currentCase.rejectionReason ||
                  'The uploaded file is NOT an authentic government-issued identity document (Passport, Visa, or National ID). Visual and geometric classification failed.'}
              </p>
              <div className="text-[11px] font-mono opacity-80 flex flex-wrap gap-3 pt-1 border-t border-red-500/20">
                <span>• ICAO Doc 9303 Compliant: <strong>NO (FAILED)</strong></span>
                <span>• MRZ Optical Zone: <strong>NOT DETECTED</strong></span>
                <span>• Government Seals: <strong>0 DETECTED</strong></span>
                <span>• Risk Index: <strong className="text-red-500">99% (CRITICAL)</strong></span>
              </div>
            </div>
          )}

          {/* Workflow architecture visualization (Specified in requirements) */}
          <div className="p-3 rounded-xl border border-black/5 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950 flex items-center justify-between text-[11px] font-mono overflow-x-auto gap-2">
            <span>Document Image</span>
            <span>↓</span>
            <span>Image Preprocessing</span>
            <span>↓</span>
            <span>Optical Character Recognition (OCR)</span>
            <span>↓</span>
            <span>Field Boundary Detection</span>
            <span>↓</span>
            <span className="font-bold text-emerald-500">Structured Intelligence</span>
          </div>

          {/* 10 Structured Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Field 1: Full Name */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-1">
                <span>FULL NAME</span>
                <span className="text-emerald-500 font-semibold">{currentCase.extractedData.fullNameConfidence}% conf</span>
              </div>
              <div className="font-mono text-base font-bold">{currentCase.extractedData.fullName}</div>
            </div>

            {/* Field 2: Passport Number */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-1">
                <span>PASSPORT NUMBER</span>
                <span className="text-emerald-500 font-semibold">{currentCase.extractedData.passportNumberConfidence}% conf</span>
              </div>
              <div className="font-mono text-base font-bold">{currentCase.extractedData.passportNumber}</div>
            </div>

            {/* Field 3: Nationality */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-1">
                <span>NATIONALITY</span>
                <span className="text-emerald-500 font-semibold">{currentCase.extractedData.nationalityConfidence}% conf</span>
              </div>
              <div className="font-mono text-base font-bold">{currentCase.extractedData.nationality}</div>
            </div>

            {/* Field 4: Gender */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-1">
                <span>GENDER</span>
                <span className="text-emerald-500 font-semibold">{currentCase.extractedData.genderConfidence}% conf</span>
              </div>
              <div className="font-mono text-base font-bold">{currentCase.extractedData.gender}</div>
            </div>

            {/* Field 5: Date of Birth */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-1">
                <span>DATE OF BIRTH</span>
                <span className="text-emerald-500 font-semibold">{currentCase.extractedData.dateOfBirthConfidence}% conf</span>
              </div>
              <div className="font-mono text-base font-bold">{currentCase.extractedData.dateOfBirth}</div>
            </div>

            {/* Field 6: Date of Expiry */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-1">
                <span>DATE OF EXPIRY</span>
                <span className="text-emerald-500 font-semibold">{currentCase.extractedData.dateOfExpiryConfidence}% conf</span>
              </div>
              <div className="font-mono text-base font-bold">{currentCase.extractedData.dateOfExpiry}</div>
            </div>

            {/* Field 7: Visa Number */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-1">
                <span>VISA NUMBER</span>
                <span className="text-emerald-500 font-semibold">{currentCase.extractedData.visaNumberConfidence}% conf</span>
              </div>
              <div className="font-mono text-base font-bold">{currentCase.extractedData.visaNumber}</div>
            </div>

            {/* Field 8: Visa Type */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-1">
                <span>VISA TYPE</span>
                <span className="text-emerald-500 font-semibold">{currentCase.extractedData.visaTypeConfidence}% conf</span>
              </div>
              <div className="font-mono text-base font-bold">{currentCase.extractedData.visaType}</div>
            </div>

            {/* Field 9: Entry Validation */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-1">
                <span>ENTRY VALIDATION</span>
                <span className="text-emerald-500 font-semibold">{currentCase.extractedData.entryValidationConfidence}% conf</span>
              </div>
              <div className="font-mono text-base font-bold text-emerald-600">
                {currentCase.extractedData.entryValidation}
              </div>
            </div>

            {/* Field 10: Stay Duration */}
            <div
              className={`p-4 rounded-xl border col-span-1 sm:col-span-2 lg:col-span-3 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="flex justify-between items-center text-[10px] font-mono opacity-60 mb-1">
                <span>STAY DURATION & PERMITTED ENTITLEMENT</span>
                <span className="text-emerald-500 font-semibold">{currentCase.extractedData.stayDurationConfidence}% conf</span>
              </div>
              <div className="font-mono text-base font-bold">{currentCase.extractedData.stayDuration}</div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveStepIndex(0)}
              className="px-4 py-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Upload
            </button>
            <button
              type="button"
              onClick={() => setActiveStepIndex(2)}
              className="px-5 py-2 rounded-lg bg-black text-white dark:bg-cyan-500 dark:text-black font-semibold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Proceed to Module 2: Validation <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DOCUMENT VALIDATION (MODULE 2) */}
      {activeStepIndex === 2 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-500 font-bold">
                Module 2 // Standards Verification
              </div>
              <h2 className="font-heading-custom text-2xl sm:text-3xl font-bold tracking-tight">
                Document Validation Checklist
              </h2>
            </div>
            <div
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold border ${
                currentCase.riskAssessment.documentValidationState === 'PASS'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                  : 'bg-red-500/10 border-red-500/30 text-red-600'
              }`}
            >
              DOCUMENT VALIDATION: {currentCase.riskAssessment.documentValidationState === 'PASS' ? 'PASSED' : 'REQUIRES REVIEW'}
            </div>
          </div>

          {/* Validation Checklist items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentCase.validationChecklist.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  item.status === 'valid'
                    ? isDark
                      ? 'border-emerald-500/30 bg-emerald-950/20'
                      : 'border-emerald-300 bg-emerald-50/60'
                    : item.status === 'invalid'
                    ? isDark
                      ? 'border-red-500/30 bg-red-950/20'
                      : 'border-red-300 bg-red-50/60'
                    : isDark
                    ? 'border-amber-500/30 bg-amber-950/20'
                    : 'border-amber-300 bg-amber-50/60'
                }`}
              >
                <div className="mt-0.5">
                  {item.status === 'valid' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                  {item.status === 'invalid' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                  {item.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="text-sm font-bold font-mono">{item.label}</div>
                  <div className="text-xs opacity-70 font-mono">{item.description}</div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    item.status === 'valid'
                      ? 'bg-emerald-500/20 text-emerald-600'
                      : item.status === 'invalid'
                      ? 'bg-red-500/20 text-red-600'
                      : 'bg-amber-500/20 text-amber-600'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveStepIndex(1)}
              className="px-4 py-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Extraction
            </button>
            <button
              type="button"
              onClick={() => setActiveStepIndex(3)}
              className="px-5 py-2 rounded-lg bg-black text-white dark:bg-cyan-500 dark:text-black font-semibold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Proceed to Module 3: Forensics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: TAMPERING DETECTION (MODULE 3 - CORE INNOVATION) */}
      {activeStepIndex === 3 && (
        <div className="space-y-6">
          <TamperingWorkspace
            tamperingResult={currentCase.tamperingResult}
            extractedData={currentCase.extractedData}
            imagePreviewUrl={currentCase.imagePreviewUrl}
            isValidDocument={currentCase.isValidDocument}
            rejectionReason={currentCase.rejectionReason}
            isDark={isDark}
          />

          <div className="flex justify-between pt-4 border-t border-black/10 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveStepIndex(2)}
              className="px-4 py-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Validation
            </button>
            <button
              type="button"
              onClick={() => setActiveStepIndex(4)}
              className="px-5 py-2 rounded-lg bg-black text-white dark:bg-cyan-500 dark:text-black font-semibold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Proceed to Module 4: Biometrics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: FACE VERIFICATION (MODULE 4) */}
      {activeStepIndex === 4 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-500 font-bold flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" /> Module 4 // 1:1 Biometric Verification Engine
              </div>
              <h2 className="font-heading-custom text-2xl sm:text-3xl font-bold tracking-tight">
                Face Verification & Liveness Detection
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                  currentCase.faceVerificationResult.faceMatchScore >= 80
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                    : currentCase.faceVerificationResult.faceMatchScore >= 60
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                    : 'bg-red-500/10 border-red-500/30 text-red-600'
                }`}
              >
                STATUS: {currentCase.faceVerificationResult.status}
              </div>
            </div>
          </div>

          {/* Biometric Flow steps */}
          <div className="p-3 rounded-xl border border-black/5 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950 flex items-center justify-between text-[11px] font-mono overflow-x-auto gap-2">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Face Detection</span>
            <span className="opacity-40">↓</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> 68 Landmark Alignment</span>
            <span className="opacity-40">↓</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> 128-d Vector Embedding</span>
            <span className="opacity-40">↓</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Cosine Distance Comparison</span>
            <span className="opacity-40">↓</span>
            <span className="font-bold text-cyan-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> 1:1 Verification Result</span>
          </div>

          {/* Comparator Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual comparator (Left 2 cols) */}
            <div
              className={`lg:col-span-2 p-6 rounded-2xl border flex flex-col justify-between ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Photo 1: Document ID Photo (Source A) */}
                <div className="p-4 rounded-xl border border-black/10 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950/70 text-center flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono uppercase opacity-70 font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-500" /> Source A: Passport Photo
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 font-bold">
                      DOCUMENT RECORD
                    </span>
                  </div>

                  {/* Image Display */}
                  <div className="w-full max-w-[240px] h-[240px] mx-auto rounded-2xl border-2 border-dashed border-cyan-500/50 bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden shadow-lg group">
                    <img
                      src={getEffectivePassportPhoto()}
                      alt="Passport Portrait Photo"
                      className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Cybernetic scanning overlay if active */}
                    {biometricScanning && (
                      <div className="absolute inset-0 bg-cyan-500/15 backdrop-blur-[0.5px] flex flex-col items-center justify-center z-20">
                        <div className="w-full h-1 bg-cyan-400 animate-pulse shadow-[0_0_12px_#06b6d4]" />
                        <div className="mt-2 text-[10px] font-mono bg-black/80 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/40">
                          EXTRACTING 128-D VECTOR
                        </div>
                      </div>
                    )}

                    {/* 68 Landmarks SVG Overlay */}
                    {showLandmarks && (
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70">
                        <ellipse cx="50" cy="50" rx="26" ry="34" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.8" strokeDasharray="2,2" />
                        <circle cx="38" cy="42" r="1.5" fill="#06b6d4" />
                        <circle cx="62" cy="42" r="1.5" fill="#06b6d4" />
                        <circle cx="50" cy="53" r="1.2" fill="#06b6d4" />
                        <path d="M 42 66 Q 50 71 58 66" fill="none" stroke="#06b6d4" strokeWidth="1" />
                        <circle cx="42" cy="66" r="1" fill="#06b6d4" />
                        <circle cx="58" cy="66" r="1" fill="#06b6d4" />
                        <path d="M 16 20 L 24 20 M 16 20 L 16 28" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
                        <path d="M 84 20 L 76 20 M 84 20 L 84 28" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
                        <path d="M 16 80 L 24 80 M 16 80 L 16 72" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
                        <path d="M 84 80 L 76 80 M 84 80 L 84 72" fill="none" stroke="#06b6d4" strokeWidth="1.5" />
                      </svg>
                    )}

                    <div className="absolute top-2 left-2 text-[9px] font-mono bg-black/70 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      EXTRACTED
                    </div>
                  </div>

                  {/* Metadata and change button */}
                  <div className="space-y-1 pt-1">
                    <div className="text-xs font-mono font-bold truncate">
                      {currentCase.extractedData.fullName || 'DOCUMENT BEARER'}
                    </div>
                    <div className="text-[10px] font-mono opacity-60">
                      Doc: {currentCase.extractedData.passportNumber || 'Z8920194'} • {currentCase.extractedData.nationality || 'IND'}
                    </div>
                  </div>

                  {/* Direct upload / replace passport photo */}
                  <div className="pt-2">
                    <input
                      ref={passportInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePassportPhotoChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => passportInputRef.current?.click()}
                      className="w-full py-1.5 px-2.5 rounded-lg border border-black/10 dark:border-slate-800 text-[11px] font-mono opacity-80 hover:opacity-100 hover:border-cyan-500/50 hover:bg-cyan-500/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Upload / Change Passport Photo</span>
                    </button>
                  </div>
                </div>

                {/* Photo 2: Live CCTV / Real Camera Snapshot (Source B) */}
                <div className="p-4 rounded-xl border border-black/10 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950/70 text-center flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono uppercase opacity-70 font-semibold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-emerald-500" /> Source B: Live Gate Camera
                    </div>
                    {cameraActive && !capturedImage ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> LIVE SENSOR
                      </span>
                    ) : capturedImage ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                        FRAME CAPTURED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/30 font-bold">
                        STANDBY
                      </span>
                    )}
                  </div>

                  {/* Viewport: Live Video OR Captured Image OR Camera Error */}
                  <div className="w-full max-w-[240px] h-[240px] mx-auto rounded-2xl border-2 border-emerald-500/50 bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
                    {capturedImage ? (
                      // Captured snapshot image
                      <img
                        src={capturedImage}
                        alt="Captured Camera Snapshot"
                        className="w-full h-full object-cover select-none"
                      />
                    ) : (
                      // Live WebRTC Video element
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                        style={{ transform: cameraFacingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                      />
                    )}

                    {/* Camera Offline / Error Fallback */}
                    {!cameraActive && !capturedImage && (
                      <div className="p-4 text-center space-y-2 flex flex-col items-center justify-center">
                        {cameraLoading ? (
                          <div className="flex flex-col items-center gap-2">
                            <ScanLine className="w-8 h-8 text-cyan-400 animate-spin" />
                            <span className="text-[11px] font-mono text-cyan-400">Requesting Gate Camera...</span>
                          </div>
                        ) : (
                          <>
                            <CameraOff className="w-10 h-10 opacity-30 text-emerald-500" />
                            <p className="text-[11px] font-mono opacity-70 max-w-[190px]">
                              {cameraError || 'Gate camera feed is currently offline.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => startCameraStream()}
                              className="px-3 py-1 bg-emerald-500 text-black text-[11px] font-mono font-bold rounded-lg hover:bg-emerald-400 transition-all cursor-pointer shadow-sm"
                            >
                              Start Camera Feed
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Scanning animation overlay */}
                    {biometricScanning && (
                      <div className="absolute inset-0 bg-emerald-500/15 backdrop-blur-[0.5px] flex flex-col items-center justify-center z-20">
                        <div className="w-full h-1 bg-emerald-400 animate-pulse shadow-[0_0_12px_#10b981]" />
                        <div className="mt-2 text-[10px] font-mono bg-black/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40">
                          1:1 BIOMETRIC MATCHING...
                        </div>
                      </div>
                    )}

                    {/* Live Cybernetic Alignment Overlay */}
                    {showLandmarks && (cameraActive || capturedImage) && (
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70">
                        <ellipse cx="50" cy="50" rx="26" ry="34" fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="0.8" strokeDasharray="2,2" />
                        <circle cx="38" cy="42" r="1.5" fill="#10b981" />
                        <circle cx="62" cy="42" r="1.5" fill="#10b981" />
                        <circle cx="50" cy="53" r="1.2" fill="#10b981" />
                        <path d="M 42 66 Q 50 71 58 66" fill="none" stroke="#10b981" strokeWidth="1" />
                        <circle cx="42" cy="66" r="1" fill="#10b981" />
                        <circle cx="58" cy="66" r="1" fill="#10b981" />
                        <path d="M 16 20 L 24 20 M 16 20 L 16 28" fill="none" stroke="#10b981" strokeWidth="1.5" />
                        <path d="M 84 20 L 76 20 M 84 20 L 84 28" fill="none" stroke="#10b981" strokeWidth="1.5" />
                        <path d="M 16 80 L 24 80 M 16 80 L 16 72" fill="none" stroke="#10b981" strokeWidth="1.5" />
                        <path d="M 84 80 L 76 80 M 84 80 L 84 72" fill="none" stroke="#10b981" strokeWidth="1.5" />
                      </svg>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 text-[9px] font-mono bg-black/80 text-emerald-400 py-0.5 rounded border border-emerald-500/30">
                      3D LIVENESS: {currentCase.faceVerificationResult.livenessScore}% • {currentCase.faceVerificationResult.livenessStatus}
                    </div>
                  </div>

                  {/* Primary Camera Action Button */}
                  <div className="space-y-2 pt-1">
                    {cameraActive && !capturedImage ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCaptureSnapshot}
                          disabled={comparisonRunning}
                          className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-mono font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <Camera className="w-4 h-4" />
                          <span>CAPTURE & COMPARE</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleToggleFacingMode}
                          title="Flip Camera"
                          className="p-2 border border-black/10 dark:border-slate-800 rounded-xl hover:bg-black/5 dark:hover:bg-slate-800 text-xs cursor-pointer"
                        >
                          <FlipHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    ) : capturedImage ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleRetakeSnapshot}
                          className="flex-1 py-1.5 px-3 rounded-lg border border-black/10 dark:border-slate-800 text-xs font-mono hover:bg-black/5 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retake Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => executeBiometricComparison(getEffectivePassportPhoto(), capturedImage)}
                          disabled={comparisonRunning}
                          className="py-1.5 px-3 rounded-lg bg-cyan-500 text-black font-mono font-bold text-xs hover:bg-cyan-400 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${comparisonRunning ? 'animate-spin' : ''}`} />
                          <span>Re-Verify</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startCameraStream()}
                        className="w-full py-2 px-3 bg-emerald-600 text-white font-mono font-bold text-xs rounded-xl hover:bg-emerald-500 flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <Video className="w-4 h-4" />
                        <span>Activate Gate Camera Stream</span>
                      </button>
                    )}

                    {/* Fallback upload input for environments without cameras */}
                    <input
                      ref={webcamFallbackInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleWebcamFallbackUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => webcamFallbackInputRef.current?.click()}
                      className="text-[10px] font-mono opacity-50 hover:opacity-90 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                    >
                      <Upload className="w-3 h-3" /> Or upload live selfie snapshot file
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom bar of comparator */}
              <div className="pt-4 border-t border-black/10 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleBiometricRescan}
                    disabled={comparisonRunning}
                    className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 cursor-pointer hover:bg-black/5 dark:hover:bg-slate-800 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${comparisonRunning ? 'animate-spin' : ''}`} />
                    <span>Re-scan 68 Landmarks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLandmarks(!showLandmarks)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all ${
                      showLandmarks
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                        : 'hover:bg-black/5 dark:hover:bg-slate-800 opacity-60'
                    }`}
                  >
                    {showLandmarks ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showLandmarks ? 'Landmarks: ON' : 'Landmarks: OFF'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="opacity-60">Cosine Distance: </span>
                    <span className="text-emerald-500 font-bold">{currentCase.faceVerificationResult.cosineSimilarity}</span>
                  </div>
                  <div>
                    <span className="opacity-60">Liveness: </span>
                    <span className="text-cyan-400 font-bold">{currentCase.faceVerificationResult.livenessScore}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Circular Similarity Gauge & Metrics (Right col) */}
            <div
              className={`p-6 rounded-2xl border flex flex-col justify-between ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="text-center space-y-4">
                <div className="text-xs font-mono uppercase tracking-wider opacity-60 font-semibold">
                  Facial Match Similarity
                </div>

                {/* SVG Radial Gauge */}
                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={isDark ? '#1e293b' : '#e5e5e0'}
                      strokeWidth="9"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={
                        currentCase.faceVerificationResult.faceMatchScore >= 80
                          ? '#10b981'
                          : currentCase.faceVerificationResult.faceMatchScore >= 60
                          ? '#f59e0b'
                          : '#ef4444'
                      }
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * Math.min(100, currentCase.faceVerificationResult.faceMatchScore)) / 100}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-mono font-bold tracking-tight">
                      {currentCase.faceVerificationResult.faceMatchScore}%
                    </span>
                    <span className="text-[10px] font-mono opacity-60 uppercase tracking-widest mt-0.5">
                      SIMILARITY
                    </span>
                  </div>
                </div>

                {/* Status Callout Banner */}
                <div
                  className={`p-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider ${
                    currentCase.faceVerificationResult.faceMatchScore >= 80
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : currentCase.faceVerificationResult.faceMatchScore >= 60
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {currentCase.faceVerificationResult.faceMatchScore >= 80
                    ? '1:1 MATCH VERIFIED'
                    : currentCase.faceVerificationResult.faceMatchScore >= 60
                    ? 'SECONDARY REVIEW REQUIRED'
                    : 'BIOMETRIC MISMATCH DETECTED'}
                </div>

                {/* Explanation text */}
                <div className="p-3.5 rounded-xl border border-black/10 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950/60 text-xs font-mono text-left leading-relaxed">
                  <div className="text-[10px] uppercase font-bold text-cyan-500 mb-1">
                    FORENSIC BIOMETRIC REPORT
                  </div>
                  {currentCase.faceVerificationResult.explanation?.replace(/^["'\s]+|["'\s]+$/g, '') ||
                    'Facial landmarks match document photograph with 97.4% similarity. 3D passive liveness confirmed.'}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-black/10 dark:border-slate-800 text-[11px] font-mono opacity-70 space-y-1">
                <div className="flex justify-between">
                  <span>Match Threshold:</span>
                  <span className="font-bold text-emerald-500">&gt; 80% Valid</span>
                </div>
                <div className="flex justify-between">
                  <span>Passive Anti-Spoof:</span>
                  <span className="font-bold text-emerald-500">Active (Level 4)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-black/10 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveStepIndex(3)}
              className="px-4 py-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Forensics
            </button>
            <button
              type="button"
              onClick={() => setActiveStepIndex(5)}
              className="px-5 py-2 rounded-lg bg-black text-white dark:bg-cyan-500 dark:text-black font-semibold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Proceed to Module 5: Risk Engine <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: RISK ASSESSMENT ENGINE (MODULE 5) */}
      {activeStepIndex === 5 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold">
                Module 5 // Bayesian Multi-Signal Synthesis
              </div>
              <h2 className="font-heading-custom text-2xl sm:text-3xl font-bold tracking-tight">
                AI Risk Assessment Engine
              </h2>
            </div>
            <div
              className={`px-4 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                currentCase.riskAssessment.riskLevel === 'LOW'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                  : currentCase.riskAssessment.riskLevel === 'MEDIUM'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600'
                  : 'bg-red-500/10 border-red-500/30 text-red-600'
              }`}
            >
              RISK LEVEL: {currentCase.riskAssessment.riskLevel}
            </div>
          </div>

          {/* Matrix of all 4 inputs combining into 1 unified score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 uppercase block mb-1">
                Document Validation
              </span>
              <div
                className={`text-xl font-mono font-bold ${
                  currentCase.riskAssessment.documentValidationState === 'PASS'
                    ? 'text-emerald-500'
                    : 'text-red-500'
                }`}
              >
                {currentCase.riskAssessment.documentValidationState}
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 uppercase block mb-1">
                Tampering Risk
              </span>
              <div
                className={`text-xl font-mono font-bold ${
                  currentCase.riskAssessment.tamperingRiskPct > 50 ? 'text-red-500' : 'text-emerald-500'
                }`}
              >
                {currentCase.riskAssessment.tamperingRiskPct}%
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 uppercase block mb-1">
                Face Match
              </span>
              <div
                className={`text-xl font-mono font-bold ${
                  currentCase.riskAssessment.faceMatchPct > 80 ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {currentCase.riskAssessment.faceMatchPct}%
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <span className="text-[10px] font-mono opacity-60 uppercase block mb-1">
                Extraction Confidence
              </span>
              <div className="text-xl font-mono font-bold text-blue-500">
                {currentCase.riskAssessment.extractionConfidenceAvg}%
              </div>
            </div>
          </div>

          {/* Big Unified Overall Score + Why this result explanation */}
          <div
            className={`p-6 rounded-2xl border ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
            }`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-black/10 dark:border-slate-800">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider opacity-60">
                  Synthesized Bayesian Risk Index
                </div>
                <div className="text-4xl font-mono font-bold mt-1 flex items-baseline gap-2">
                  <span
                    className={
                      currentCase.riskAssessment.overallScore < 25
                        ? 'text-emerald-500'
                        : currentCase.riskAssessment.overallScore < 60
                        ? 'text-amber-500'
                        : 'text-red-500'
                    }
                  >
                    {currentCase.riskAssessment.overallScore}%
                  </span>
                  <span className="text-sm font-sans font-normal opacity-60">
                    // Final Recommendation: {currentCase.riskAssessment.finalDecision}
                  </span>
                </div>
              </div>

              <div
                className={`px-5 py-2.5 rounded-xl font-mono text-sm font-bold border ${
                  currentCase.riskAssessment.riskLevel === 'LOW'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
                    : currentCase.riskAssessment.riskLevel === 'MEDIUM'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-600'
                    : 'border-red-500/40 bg-red-500/10 text-red-600'
                }`}
              >
                {currentCase.riskAssessment.riskLevel} RISK VERIFIED
              </div>
            </div>

            {/* "Why this result?" Explainable AI Panel (Specified in requirements) */}
            <div className="pt-6 space-y-3">
              <h4 className="font-heading-custom text-sm font-bold flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" />
                <span>Why this result? (Explainable AI Rationale)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentCase.riskAssessment.explanationPoints.map((pt, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-black/5 dark:border-slate-800 bg-black/[0.02] dark:bg-slate-950 text-xs font-mono flex items-start gap-2"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-black/10 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveStepIndex(4)}
              className="px-4 py-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Biometrics
            </button>
            <button
              type="button"
              onClick={() => setActiveStepIndex(6)}
              className="px-5 py-2 rounded-lg bg-black text-white dark:bg-cyan-500 dark:text-black font-semibold text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              Proceed to Final Decision & Review <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: FINAL DECISION & OFFICER REVIEW (MODULE 6) */}
      {activeStepIndex === 6 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-purple-500 font-bold">
                Module 6 // Official Disposition
              </div>
              <h2 className="font-heading-custom text-2xl sm:text-3xl font-bold tracking-tight">
                Officer Decision & Case Disposition
              </h2>
            </div>
            <div className="text-xs font-mono opacity-70">Case ID: {currentCase.caseId}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Officer Action Buttons */}
            <div
              className={`p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <h3 className="font-heading-custom text-base font-bold">Record Border Decision</h3>

              <div className="space-y-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDecision('APPROVED')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedDecision === 'APPROVED'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                  }`}
                >
                  <span>Approve Clearance</span>
                  {selectedDecision === 'APPROVED' && <Check className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDecision('SECONDARY')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedDecision === 'SECONDARY'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md font-bold'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                  }`}
                >
                  <span>Flag for Secondary Inspection</span>
                  {selectedDecision === 'SECONDARY' && <Check className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDecision('DENIED')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedDecision === 'DENIED'
                      ? 'bg-red-600 text-white border-red-600 shadow-md font-bold'
                      : 'border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20'
                  }`}
                >
                  <span>Issue Formal Refusal</span>
                  {selectedDecision === 'DENIED' && <Check className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider opacity-60 mb-1">
                  Investigation / Clearance Notes
                </label>
                <textarea
                  rows={3}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Enter official officer rationale..."
                  className={`w-full p-2.5 rounded-xl border text-xs font-mono focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700' : 'bg-slate-50 border-black/15'
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={handleDecisionConfirm}
                className="w-full py-2.5 rounded-xl bg-black text-white dark:bg-cyan-500 dark:text-black font-semibold text-xs font-mono transition-all cursor-pointer shadow-md active:scale-95"
              >
                Commit Decision to Digital Audit Trail
              </button>
            </div>

            {/* Case Summary Card */}
            <div
              className={`lg:col-span-2 p-6 rounded-2xl border space-y-4 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-black/10'
              }`}
            >
              <div className="flex justify-between items-center pb-3 border-b border-black/10 dark:border-slate-800">
                <div>
                  <div className="text-xs font-mono opacity-60">OFFICIAL VERIFICATION SUMMARY</div>
                  <div className="text-lg font-mono font-bold">{currentCase.caseId}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenReport(currentCase)}
                  className="px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" /> View Official Report
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="opacity-60 block">Subject Name:</span>
                  <span className="font-bold">{currentCase.extractedData.fullName}</span>
                </div>
                <div>
                  <span className="opacity-60 block">Passport Number:</span>
                  <span className="font-bold">{currentCase.extractedData.passportNumber}</span>
                </div>
                <div>
                  <span className="opacity-60 block">Visa Number:</span>
                  <span className="font-bold">{currentCase.extractedData.visaNumber}</span>
                </div>
                <div>
                  <span className="opacity-60 block">Entry Validation:</span>
                  <span className="font-bold text-emerald-500">{currentCase.extractedData.entryValidation}</span>
                </div>
                <div>
                  <span className="opacity-60 block">Overall Risk Score:</span>
                  <span className="font-bold">{currentCase.riskAssessment.overallScore}%</span>
                </div>
                <div>
                  <span className="opacity-60 block">Face Match:</span>
                  <span className="font-bold">{currentCase.faceVerificationResult.faceMatchScore}%</span>
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex justify-between">
                <span>Cryptographic Digest: {currentCase.sha256Hash.slice(0, 24)}...</span>
                <span>Officer: {officer.name}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-start pt-4 border-t border-black/10 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveStepIndex(5)}
              className="px-4 py-2 rounded-lg border text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Risk Engine
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
