import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Compass,
  Lightbulb,
  RefreshCw,
  Target,
} from 'lucide-react';
import { fetchModuleContent } from '../../services/aiClient';
import {
  Division,
  ModuleBlueprint,
  ModuleContentData,
  UserProfile,
} from '../../types/academy';
import {
  ErrorRetryCard,
  GlowSkeleton,
  ShareActions,
} from '../ui/CommonUI';

interface DivisionTrainingTabProps {
  division: Division;
  profile: UserProfile | null;
  initialModuleId?: string;
  completedModules: Record<string, string>;
  cachedModules: Record<string, ModuleContentData>;
  onCacheModule: (content: ModuleContentData) => void;
  onToggleComplete: (divisionId: string, moduleId: string) => void;
  onMarkComplete: (divisionId: string, moduleId: string) => void;
  onStartModuleQuiz: (moduleId: string) => void;
  onRecordActivity: (moduleId: string) => void;
}

export function DivisionTrainingTab({
  division,
  profile,
  initialModuleId,
  completedModules,
  cachedModules,
  onCacheModule,
  onToggleComplete,
  onMarkComplete,
  onStartModuleQuiz,
  onRecordActivity,
}: DivisionTrainingTabProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    initialModuleId || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialModuleId) {
      setSelectedModuleId(initialModuleId);
    }
  }, [initialModuleId]);

  const selectedModule: ModuleBlueprint | null = useMemo(
    () => division.modules.find((m) => m.id === selectedModuleId) || null,
    [division.modules, selectedModuleId]
  );

  const cachedContent = selectedModule ? cachedModules[selectedModule.id] : undefined;

  const generateModule = useCallback(
    async (mod: ModuleBlueprint) => {
      setLoading(true);
      setError(null);
      try {
        const content = await fetchModuleContent({
          moduleId: mod.id,
          divisionName: division.name,
          moduleTitle: mod.title,
          moduleLevel: mod.levelLabel,
          moduleSummary: mod.summary,
          profile,
        });
        onCacheModule(content);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal memuat materi modul. Silakan coba lagi.'
        );
      } finally {
        setLoading(false);
      }
    },
    [division.name, profile, onCacheModule]
  );

  useEffect(() => {
    if (selectedModule) {
      onRecordActivity(selectedModule.id);
      if (!cachedModules[selectedModule.id] && !loading && !error) {
        generateModule(selectedModule);
      }
    }
  }, [selectedModule, cachedModules, loading, error, generateModule, onRecordActivity]);

  const levels = [
    { level: 1, title: 'Level 1 — Dasar', subtitle: 'Fondasi kerja, keselamatan & SOP harian' },
    { level: 2, title: 'Level 2 — Menengah', subtitle: 'Situasi operasional sibuk, sanitasi & koordinasi tim' },
    { level: 3, title: 'Level 3 — Mahir', subtitle: 'Penanganan krisis, standar VIP & kesiapan promosi' },
  ] as const;

  // Module Reader View
  if (selectedModule) {
    const isDone = Boolean(completedModules[selectedModule.id]);
    const currentIdx = division.modules.findIndex((m) => m.id === selectedModule.id);
    const nextModule =
      currentIdx >= 0 && currentIdx < division.modules.length - 1
        ? division.modules[currentIdx + 1]
        : null;

    const shareText = cachedContent
      ? `Ringkasan Modul: ${selectedModule.title} (${division.shortName})\n\nPoin Kunci:\n${cachedContent.keyTakeaways
          .map((k, i) => `${i + 1}. ${k}`)
          .join('\n')}\n\nBelajar di CruiseCrew Academy`
      : `Sedang mempelajari modul "${selectedModule.title}" di CruiseCrew Academy.`;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedModuleId(null);
              setError(null);
            }}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 min-h-[44px] text-sm font-medium text-[#A9B8DB] hover:text-[#F4F7FF] bg-[#0B1738]/75 border border-[#5A96FF]/25 hover:border-[#5AA2FF]/50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Daftar Modul
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {cachedContent && (
              <button
                type="button"
                onClick={() => generateModule(selectedModule)}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 min-h-[44px] text-xs sm:text-sm font-medium text-[#A9B8DB] hover:text-[#F4F7FF] bg-[#0B1738]/75 border border-[#5A96FF]/25 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Buat Ulang AI
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleComplete(division.id, selectedModule.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 min-h-[44px] text-sm font-semibold transition-all cursor-pointer border ${
                isDone
                  ? 'bg-[#0F332B]/80 border-[#34D399]/50 text-[#34D399]'
                  : 'bg-[#142864]/70 border-[#5AA2FF]/35 text-[#F4F7FF] hover:border-[#34D399]/60'
              }`}
            >
              {isDone ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Modul Selesai
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  Tandai Selesai
                </>
              )}
            </button>
          </div>
        </div>

        {/* Module Header Card */}
        <div className="glass-card rounded-2xl p-6 space-y-2">
          <p className="text-xs font-medium text-[#FFA24D]">
            {selectedModule.levelLabel} · Modul {selectedModule.order} dari{' '}
            {division.modules.length} · Estimasi {selectedModule.estimatedMinutes} menit
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F4F7FF]">
            {selectedModule.title}
          </h2>
          <p className="text-sm text-[#A9B8DB] leading-relaxed">
            {selectedModule.summary}
          </p>
        </div>

        {loading && !cachedContent && (
          <GlowSkeleton
            title="Senior Officer AI sedang menyiapkan modul pelatihan..."
            subtitle="Materi akan otomatis disimpan di perangkatmu agar bisa dibaca ulang tanpa menunggu."
            lines={6}
          />
        )}

        {error && !cachedContent && (
          <ErrorRetryCard message={error} onRetry={() => generateModule(selectedModule)} />
        )}

        {cachedContent && (
          <div className="space-y-6">
            {error && (
              <ErrorRetryCard
                message={error}
                onRetry={() => generateModule(selectedModule)}
              />
            )}

            {/* Tujuan Belajar */}
            <section className="glass-card rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <Target className="w-5 h-5 text-[#5AA2FF]" />
                <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
                  Tujuan Belajar
                </h3>
              </div>
              <ul className="space-y-2">
                {cachedContent.learningObjectives.map((obj, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-[#D7E2FA] leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-1" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Penjelasan Materi */}
            <section className="space-y-4">
              {cachedContent.sections.map((sec, idx) => (
                <article key={idx} className="glass-card rounded-2xl p-6 space-y-3.5">
                  <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
                    {idx + 1}. {sec.heading}
                  </h3>
                  <div className="text-sm sm:text-[15px] text-[#D7E2FA] leading-relaxed whitespace-pre-line">
                    {sec.explanation}
                  </div>
                  <div className="rounded-xl bg-[#0D1E4D]/80 border border-[#5AA2FF]/30 p-4 text-sm text-[#E8F0FF]">
                    <span className="font-semibold text-[#5AA2FF]">Aksi Kunci di Kapal: </span>
                    {sec.keyAction}
                  </div>
                </article>
              ))}
            </section>

            {/* Contoh Situasi Nyata */}
            <section className="glass-card rounded-2xl p-6 space-y-4 border-[#FF7A1A]/35">
              <div className="flex items-center gap-2.5">
                <Compass className="w-5 h-5 text-[#FFA24D]" />
                <div>
                  <p className="text-xs font-medium text-[#FFA24D]">
                    Contoh Situasi Nyata di Kapal
                  </p>
                  <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
                    {cachedContent.realShipScenario.title}
                  </h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#091432]/80 border border-[#5A96FF]/20 p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-[#A9B8DB]">Situasi Lapangan</p>
                  <p className="text-sm text-[#D7E2FA] leading-relaxed">
                    {cachedContent.realShipScenario.situation}
                  </p>
                </div>
                <div className="rounded-xl bg-[#0B2A26]/70 border border-[#34D399]/30 p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-[#34D399]">
                    Penanganan Terbaik Kru Profesional
                  </p>
                  <p className="text-sm text-[#E1F7F0] leading-relaxed">
                    {cachedContent.realShipScenario.bestResponse}
                  </p>
                </div>
              </div>
            </section>

            {/* Tips Senior & Ringkasan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <section className="glass-card rounded-2xl p-6 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <Lightbulb className="w-5 h-5 text-[#FFA24D]" />
                  <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
                    Tips dari Senior Officer
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {cachedContent.seniorTips.map((tip, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-[#D7E2FA] leading-relaxed flex items-start gap-2.5"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#FFA24D] shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="glass-card rounded-2xl p-6 space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-[#5AA2FF]" />
                  <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
                    Ringkasan Poin Kunci
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {cachedContent.keyTakeaways.map((point, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-[#D7E2FA] leading-relaxed flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#5AA2FF] shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Footer Action Bar */}
            <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <ShareActions shareText={shareText} label="Bagikan ke" />

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onMarkComplete(division.id, selectedModule.id);
                    onStartModuleQuiz(selectedModule.id);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 min-h-[44px] text-sm font-semibold text-[#F4F7FF] bg-[#2F6BFF]/30 border border-[#5AA2FF]/50 hover:bg-[#2F6BFF]/45 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Kuis Modul Ini
                </button>

                {nextModule && (
                  <button
                    type="button"
                    onClick={() => {
                      onMarkComplete(division.id, selectedModule.id);
                      setSelectedModuleId(nextModule.id);
                      setError(null);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="cta-orange inline-flex items-center gap-2 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white cursor-pointer whitespace-nowrap"
                  >
                    Modul Berikutnya
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Learning Path Overview List (Grouped by Level 1, 2, 3)
  return (
    <div className="space-y-7">
      {levels.map((lvl) => {
        const mods = division.modules.filter((m) => m.level === lvl.level);
        if (mods.length === 0) return null;
        return (
          <section key={lvl.level} className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h2 className="font-display text-lg font-bold text-[#F4F7FF]">
                {lvl.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#A9B8DB]">{lvl.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mods.map((mod) => {
                const isDone = Boolean(completedModules[mod.id]);
                const isCached = Boolean(cachedModules[mod.id]);
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => {
                      setSelectedModuleId(mod.id);
                      setError(null);
                    }}
                    className={`glass-card glass-card-interactive rounded-2xl p-5 text-left flex flex-col justify-between cursor-pointer ${
                      isDone ? 'border-[#34D399]/40' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-medium text-[#A9B8DB] tabular-nums">
                          Modul {mod.order} · {mod.estimatedMinutes} menit
                          {isCached ? ' · Tersimpan' : ''}
                        </span>
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-[#34D399]">
                            <CheckCircle2 className="w-4 h-4" />
                            Selesai
                          </span>
                        ) : (
                          <span className="font-semibold text-[#FFA24D]">Pelajari</span>
                        )}
                      </div>

                      <h3 className="mt-2.5 font-display text-base sm:text-lg font-bold text-[#F4F7FF] leading-snug">
                        {mod.title}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-sm text-[#A9B8DB] leading-relaxed">
                        {mod.summary}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#5A96FF]/15 flex items-center justify-between text-xs font-semibold text-[#5AA2FF]">
                      <span>{isCached ? 'Buka Materi Tersimpan' : 'Buat Materi dengan AI'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
