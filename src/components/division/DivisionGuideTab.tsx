import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookMarked,
  CheckCircle2,
  ClipboardList,
  Layers,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { fetchDivisionGuide } from '../../services/aiClient';
import { Division, DivisionGuideData, UserProfile } from '../../types/academy';
import {
  DisclaimerBanner,
  ErrorRetryCard,
  GlowSkeleton,
  ShareActions,
} from '../ui/CommonUI';

interface DivisionGuideTabProps {
  division: Division;
  profile: UserProfile | null;
  cachedGuide?: DivisionGuideData;
  onCacheGuide: (guide: DivisionGuideData) => void;
}

export function DivisionGuideTab({
  division,
  profile,
  cachedGuide,
  onCacheGuide,
}: DivisionGuideTabProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGuide = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDivisionGuide({
        divisionId: division.id,
        divisionName: division.name,
        roles: division.roles,
        description: division.description,
        profile,
      });
      onCacheGuide(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memuat Pedoman Kerja. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  }, [division, profile, onCacheGuide]);

  useEffect(() => {
    if (!cachedGuide && !loading && !error) {
      loadGuide();
    }
  }, [cachedGuide, loading, error, loadGuide]);

  if (loading && !cachedGuide) {
    return (
      <div className="space-y-5">
        <GlowSkeleton
          title={`Menyusun Pedoman Kerja ${division.shortName}...`}
          subtitle="Senior Officer AI sedang merangkum tugas harian, jenjang karier, SOP inti, dan glosarium divisi ini."
          lines={5}
        />
        <DisclaimerBanner />
      </div>
    );
  }

  if (error && !cachedGuide) {
    return (
      <div className="space-y-5">
        <ErrorRetryCard message={error} onRetry={loadGuide} />
        <DisclaimerBanner />
      </div>
    );
  }

  if (!cachedGuide) return null;

  const shareText = `Pedoman Kerja ${division.name} — CruiseCrew Academy\n\nRingkasan:\n${cachedGuide.overview}\n\nTugas Harian Utama:\n${cachedGuide.dailyTasks
    .slice(0, 4)
    .map((t, i) => `${i + 1}. ${t}`)
    .join('\n')}\n\nBelajar persiapan kru kapal pesiar di CruiseCrew Academy.`;

  return (
    <div className="space-y-6">
      {/* Mandatory Disclaimer on Guide Page */}
      <DisclaimerBanner />

      {error && <ErrorRetryCard message={error} onRetry={loadGuide} />}

      {/* Overview & Actions */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#FFA24D]">
              Pedoman Kerja Standar Industri
            </p>
            <h2 className="font-display text-xl font-bold text-[#F4F7FF] mt-0.5">
              Gambaran Umum Divisi {division.shortName}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ShareActions shareText={shareText} label="Bagikan ke" />
            <button
              type="button"
              onClick={loadGuide}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 min-h-[44px] text-xs sm:text-sm font-medium text-[#A9B8DB] hover:text-[#F4F7FF] bg-[#0B1738]/70 border border-[#5A96FF]/25 hover:border-[#5AA2FF]/50 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Perbarui AI
            </button>
          </div>
        </div>

        <p className="text-sm sm:text-[15px] text-[#D7E2FA] leading-relaxed">
          {cachedGuide.overview}
        </p>
      </section>

      {/* Daily Tasks & Grooming/Behavior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5 text-[#5AA2FF] shrink-0" />
            <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
              Ringkasan Tugas Harian
            </h3>
          </div>
          <ul className="space-y-2.5">
            {cachedGuide.dailyTasks.map((task, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-[#D7E2FA] leading-relaxed"
              >
                <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-1" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-[#FFA24D] shrink-0" />
            <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
              Standar Penampilan & Perilaku
            </h3>
          </div>
          <ul className="space-y-2.5">
            {cachedGuide.groomingAndBehavior.map((rule, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-[#D7E2FA] leading-relaxed"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#FFA24D] shrink-0" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Career Path & Position Structure */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Layers className="w-5 h-5 text-[#5AA2FF] shrink-0" />
          <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
            Struktur Posisi & Jenjang Karier
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {cachedGuide.careerPath.map((step, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#091432]/75 border border-[#5A96FF]/20 p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-display text-sm sm:text-base font-bold text-[#F4F7FF]">
                  {idx + 1}. {step.position}
                </h4>
                <span className="text-xs font-medium text-[#FFA24D] shrink-0">
                  {step.level}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#A9B8DB] leading-relaxed">
                {step.responsibility}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Core SOPs Step by Step */}
      <section className="space-y-4">
        <h3 className="font-display text-lg sm:text-xl font-bold text-[#F4F7FF]">
          SOP Inti (Langkah demi Langkah)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {cachedGuide.coreSops.map((sop, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h4 className="font-display text-base font-bold text-[#F4F7FF]">
                  {sop.title}
                </h4>
                <span className="text-xs font-semibold text-[#5AA2FF] shrink-0 tabular-nums">
                  SOP 0{idx + 1}
                </span>
              </div>
              <ol className="space-y-2.5">
                {sop.steps.map((st, sIdx) => (
                  <li
                    key={sIdx}
                    className="flex items-start gap-3 text-sm text-[#D7E2FA] leading-relaxed"
                  >
                    <span className="h-6 w-6 rounded-lg bg-[#2F6BFF]/25 border border-[#5AA2FF]/35 text-xs font-bold text-[#5AA2FF] flex items-center justify-center shrink-0 tabular-nums">
                      {sIdx + 1}
                    </span>
                    <span className="pt-0.5">{st}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-[#F87171] shrink-0" />
          <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
            Kesalahan Umum yang Harus Dihindari
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cachedGuide.commonMistakes.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#0A1536]/80 border border-[#F87171]/25 p-4 space-y-2"
            >
              <p className="text-sm font-semibold text-[#FCA5A5]">
                Hindari: {item.mistake}
              </p>
              <p className="text-xs sm:text-sm text-[#C8D6F5] leading-relaxed">
                <span className="font-semibold text-[#34D399]">Cara tepat: </span>
                {item.howToAvoid}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Division Glossary */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <BookMarked className="w-5 h-5 text-[#5AA2FF] shrink-0" />
          <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
            Istilah Penting Divisi (Glosarium)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {cachedGuide.glossary.map((g, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#091432]/75 border border-[#5A96FF]/20 p-4"
            >
              <p className="font-display text-sm font-bold text-[#FFA24D]">{g.term}</p>
              <p className="mt-1 text-xs sm:text-sm text-[#C8D6F5] leading-relaxed">
                {g.meaning}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
