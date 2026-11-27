import React, { useState } from 'react';
import {
  AlertCircle,
  BedDouble,
  Camera,
  Check,
  ChefHat,
  Compass,
  ConciergeBell,
  Copy,
  HeartPulse,
  Info,
  Music,
  RefreshCw,
  Share2,
  ShieldAlert,
  Sparkles,
  UtensilsCrossed,
  Wine,
  Wrench,
} from 'lucide-react';
import { MANDATORY_DISCLAIMER } from '../../data/divisions';
import { Division } from '../../types/academy';

export function DivisionIcon({
  name,
  className = 'w-5 h-5',
}: {
  name: Division['iconName'];
  className?: string;
}) {
  switch (name) {
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'BedDouble':
      return <BedDouble className={className} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed className={className} />;
    case 'Wine':
      return <Wine className={className} />;
    case 'ChefHat':
      return <ChefHat className={className} />;
    case 'ConciergeBell':
      return <ConciergeBell className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    case 'Wrench':
      return <Wrench className={className} />;
    case 'HeartPulse':
      return <HeartPulse className={className} />;
    default:
      return <Compass className={className} />;
  }
}

export function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ocean-gradient"
      aria-hidden="true"
    >
      <div
        className="animate-orb-blue absolute -top-24 -left-24 h-[440px] w-[440px] rounded-full opacity-30 blur-[110px]"
        style={{ background: 'radial-gradient(circle, #2F6BFF 0%, transparent 70%)' }}
      />
      <div
        className="animate-orb-orange absolute top-[38%] -right-24 h-[380px] w-[380px] rounded-full opacity-20 blur-[115px]"
        style={{ background: 'radial-gradient(circle, #FF7A1A 0%, transparent 70%)' }}
      />
      <div
        className="animate-orb-blue absolute -bottom-32 left-[28%] h-[420px] w-[420px] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #5AA2FF 0%, transparent 70%)' }}
      />
    </div>
  );
}

export function ProgressBar({
  value,
  heightClass = 'h-2',
}: {
  value: number;
  heightClass?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-[#091432] border border-[#5A96FF]/20 ${heightClass}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="progress-bar-glow h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function GlowSkeleton({
  title = 'Senior Officer AI sedang menyusun materi...',
  subtitle = 'Menyesuaikan dengan standar operasional kapal pesiar dan profil belajarmu.',
  lines = 4,
}: {
  title?: string;
  subtitle?: string;
  lines?: number;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-[#2F6BFF]/25 border border-[#5AA2FF]/40 flex items-center justify-center shadow-[0_0_20px_rgba(47,107,255,0.45)]">
          <RefreshCw className="w-5 h-5 text-[#5AA2FF] animate-spin" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-display text-base sm:text-lg font-semibold text-[#F4F7FF]">
            {title}
          </h3>
          <p className="text-sm text-[#A9B8DB]">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className="skeleton-glow h-4 rounded-lg"
            style={{ width: `${idx === lines - 1 ? 68 : 100 - idx * 6}%` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="skeleton-glow h-24 rounded-xl" />
        <div className="skeleton-glow h-24 rounded-xl" />
      </div>
    </div>
  );
}

export function ErrorRetryCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border-[#F87171]/35 bg-[#3A1624]/30">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-[#F87171]/15 border border-[#F87171]/35 flex items-center justify-center text-[#FCA5A5]">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-[#F4F7FF]">
              Permintaan AI Terkendala
            </h3>
            <p className="mt-1 text-sm text-[#E2C2C9] leading-relaxed">{message}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="cta-orange shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white cursor-pointer whitespace-nowrap"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    </div>
  );
}

export function DisclaimerBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-[#5AA2FF]/20 bg-[#0A1638]/70 ${
        compact ? 'px-4 py-3' : 'px-5 py-4'
      } text-xs sm:text-[13px] text-[#A9B8DB] leading-relaxed flex items-start gap-3`}
    >
      <Info className="w-4 h-4 shrink-0 text-[#FFA24D] mt-0.5" aria-hidden="true" />
      <p>{MANDATORY_DISCLAIMER}</p>
    </div>
  );
}

export function ShareActions({
  shareText,
  label = 'Bagikan',
}: {
  shareText: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 min-h-[44px] text-xs sm:text-sm font-medium text-[#F4F7FF] bg-[#142864]/60 border border-[#5A96FF]/30 hover:border-[#5AA2FF]/60 hover:bg-[#1E3B8A]/60 transition-colors cursor-pointer whitespace-nowrap"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-[#34D399]" />
            Tersalin
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-[#5AA2FF]" />
            Salin Ringkasan
          </>
        )}
      </button>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 min-h-[44px] text-xs sm:text-sm font-medium text-[#34D399] bg-[#0F332B]/70 border border-[#34D399]/35 hover:bg-[#14463B]/80 transition-colors whitespace-nowrap"
      >
        <Share2 className="w-4 h-4" />
        {label} WhatsApp
      </a>
    </div>
  );
}
