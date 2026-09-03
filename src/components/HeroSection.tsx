import React, { useRef, useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  FileCheck,
  Eye,
  Fingerprint,
  Activity,
  Maximize2
} from 'lucide-react';

interface HeroSectionProps {
  onStartVerification: () => void;
  onExploreTech: () => void;
  onSelectDemoCase: (caseType: 'genuine' | 'tampered' | 'mismatch') => void;
  isDark: boolean;
}

const LOCAL_VIDEO_SRC = '/animate.mp4';
const REMOTE_VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08.mp4';
const SENSITIVITY = 0.8;

// Typewriter hook for hero subtitle
function useTypewriter(text: string, speed: number = 32, startDelay: number = 400) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    setDisplayed('');
    setDone(false);

    const delayTimer = setTimeout(() => {
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayed(text.slice(0, index + 1));
          index++;
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(delayTimer);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartVerification,
  onExploreTech,
  onSelectDemoCase,
  isDark,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);

  const heroSubtitle =
    'Intelligent document verification, tampering detection, and face verification for faster and more reliable identity screening.';
  const { displayed, done } = useTypewriter(heroSubtitle, 28, 300);

  // Mouse scrub logic for the video player
  const performSeek = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    if (!isSeekingRef.current) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  };

  const handleSeeked = () => {
    const video = videoRef.current;
    if (!video || !video.duration) {
      isSeekingRef.current = false;
      return;
    }
    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.03) {
      video.currentTime = targetTimeRef.current;
    } else {
      isSeekingRef.current = false;
    }
  };

  const handleVideoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    if (prevXRef.current === null) {
      prevXRef.current = currentX;
      return;
    }
    const delta = currentX - prevXRef.current;
    prevXRef.current = currentX;

    const video = videoRef.current;
    if (!video || !video.duration) return;

    // Pause autoplay during manual scrubbing
    if (!video.paused) {
      video.pause();
    }

    const offset = (delta / rect.width) * SENSITIVITY * video.duration;
    const newTarget = Math.max(0, Math.min(targetTimeRef.current + offset, video.duration));
    targetTimeRef.current = newTarget;
    performSeek();
  };

  const handleVideoMouseLeave = () => {
    prevXRef.current = null;
    const video = videoRef.current;
    if (video && video.paused) {
      video.play().catch(() => {});
    }
  };

  const handleVideoTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.touches[0].clientX - rect.left;
    if (prevXRef.current === null) {
      prevXRef.current = currentX;
      return;
    }
    const delta = currentX - prevXRef.current;
    prevXRef.current = currentX;

    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (!video.paused) {
      video.pause();
    }

    const offset = (delta / rect.width) * SENSITIVITY * video.duration;
    const newTarget = Math.max(0, Math.min(targetTimeRef.current + offset, video.duration));
    targetTimeRef.current = newTarget;
    performSeek();
  };

  const handleVideoTouchEnd = () => {
    prevXRef.current = null;
    const video = videoRef.current;
    if (video && video.paused) {
      video.play().catch(() => {});
    }
  };

  return (
    <section className="min-h-screen pt-24 pb-16 px-5 sm:px-8 md:px-12 flex flex-col justify-center relative z-10 max-w-7xl mx-auto">
      {/* 2-Column Split Layout: Left Content & Right Unblurred Video */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* LEFT COLUMN: Core Value Proposition */}
        <div className="lg:col-span-6 space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className={isDark ? 'text-cyan-400' : 'text-slate-800'}>
              Ministry of Home Affairs // SIH26188 Protocol
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-heading-custom text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            AI-Based Fake Identity & Document Screening
          </h1>

          {/* Typewriter Subtitle */}
          <p className="text-base sm:text-lg md:text-xl font-normal opacity-85 leading-relaxed min-h-[3.5em]">
            {displayed}
            {!done && (
              <span
                className={`inline-block w-[2px] h-[1.1em] align-middle ml-1 animate-cursor-blink ${
                  isDark ? 'bg-cyan-400' : 'bg-black'
                }`}
              />
            )}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onStartVerification}
              className={`px-6 py-3 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-md active:scale-95 flex items-center gap-2.5 ${
                isDark
                  ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExploreTech}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer border active:scale-95 ${
                isDark
                  ? 'border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white'
                  : 'border-black/20 bg-white text-black hover:bg-black hover:text-white'
              }`}
            >
              <span>Explore Technology</span>
            </button>
          </div>

          {/* Instant Hackathon Demo Scenario Launchpad */}
          <div className="pt-4 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider opacity-60 block">
              Direct SIH Hackathon Demo Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSelectDemoCase('genuine')}
                className="px-3.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Shield className="w-3.5 h-3.5" />
                Demo 1: Genuine Passport
              </button>

              <button
                type="button"
                onClick={() => onSelectDemoCase('tampered')}
                className="px-3.5 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-600 hover:bg-red-600 hover:text-white text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                Demo 2: Tampered Document
              </button>

              <button
                type="button"
                onClick={() => onSelectDemoCase('mismatch')}
                className="px-3.5 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-600 hover:bg-amber-600 hover:text-white text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Fingerprint className="w-3.5 h-3.5" />
                Demo 3: Face Mismatch
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: UNBLURRED VIDEO SURVEILLANCE DISPLAY */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div
            onMouseMove={handleVideoMouseMove}
            onMouseLeave={handleVideoMouseLeave}
            onTouchMove={handleVideoTouchMove}
            onTouchEnd={handleVideoTouchEnd}
            className={`w-full max-w-[560px] rounded-2xl overflow-hidden border shadow-2xl relative group transition-all duration-300 ${
              isDark
                ? 'border-cyan-500/30 bg-slate-900 shadow-[0_0_30px_rgba(6,182,212,0.15)]'
                : 'border-black/20 bg-black shadow-2xl'
            }`}
          >
            {/* Monitor Header / Telemetry Bar */}
            <div className="bg-black/90 px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs font-mono text-white/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-semibold tracking-wide">LIVE RECON FEED // CAM-04</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/50">
                <span>INTERACTIVE SCRUB</span>
                <Maximize2 className="w-3 h-3" />
              </div>
            </div>

            {/* Video Player (NO BLUR, Crisp & Clean) */}
            <div className="relative aspect-[4/3] bg-black overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                className="w-full h-full object-cover select-none"
                style={{ filter: 'none' }} // Strictly NO BLUR
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                onSeeked={handleSeeked}
              >
                <source src={LOCAL_VIDEO_SRC} type="video/mp4" />
                <source src={REMOTE_VIDEO_SRC} type="video/mp4" />
              </video>

              {/* Laser scan line sweeping across */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-center z-10">
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_#22d3ee] animate-scan-laser opacity-80" />
              </div>

              {/* Bottom Telemetry Ticker */}
              <div className="absolute bottom-2 left-3 right-3 bg-black/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10 flex items-center justify-between text-[10px] font-mono text-cyan-300 z-10">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-cyan-400" /> OPTICAL SENSOR: LOCKED
                </span>
                <span>FPS: 60 // RES: 4K UHD</span>
              </div>
            </div>

            {/* Monitor Footer Note */}
            <div className="bg-black/95 px-4 py-2 text-[11px] font-mono text-white/60 flex items-center justify-between">
              <span>Drag horizontal mouse to scrub footage</span>
              <span className="text-emerald-400">STATUS: ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step Value Pillars Below Hero */}
      <div className="mt-16 pt-8 border-t border-black/10 dark:border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
        <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02] dark:bg-slate-900/50">
          <FileCheck className="w-5 h-5 mx-auto mb-1.5 text-blue-500" />
          <div className="font-heading-custom text-xs font-semibold">AI Extraction</div>
          <div className="text-[11px] opacity-60">Sub-second OCR parsing</div>
        </div>

        <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02] dark:bg-slate-900/50">
          <Shield className="w-5 h-5 mx-auto mb-1.5 text-emerald-500" />
          <div className="font-heading-custom text-xs font-semibold">Validation Gate</div>
          <div className="text-[11px] opacity-60">ICAO Doc 9303 standards</div>
        </div>

        <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02] dark:bg-slate-900/50">
          <Eye className="w-5 h-5 mx-auto mb-1.5 text-purple-500" />
          <div className="font-heading-custom text-xs font-semibold">Tamper Forensics</div>
          <div className="text-[11px] opacity-60">Spectral & ELA analysis</div>
        </div>

        <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02] dark:bg-slate-900/50">
          <Fingerprint className="w-5 h-5 mx-auto mb-1.5 text-cyan-500" />
          <div className="font-heading-custom text-xs font-semibold">Face Verification</div>
          <div className="text-[11px] opacity-60">3D liveness detection</div>
        </div>

        <div className="p-3 rounded-xl border border-black/5 bg-black/[0.02] dark:bg-slate-900/50 col-span-2 md:col-span-1">
          <Activity className="w-5 h-5 mx-auto mb-1.5 text-amber-500" />
          <div className="font-heading-custom text-xs font-semibold">Digital Audit Trail</div>
          <div className="text-[11px] opacity-60">Cryptographic SHA-256</div>
        </div>
      </div>
    </section>
  );
};
