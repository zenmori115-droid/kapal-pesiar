import React, { useState } from 'react';
import { BookMarked, Compass, Lightbulb, Search } from 'lucide-react';
import { POPULAR_GLOSSARY_TERMS } from '../../data/divisions';
import { lookupGlossaryTerm } from '../../services/aiClient';
import { GlossaryEntry, UserProfile } from '../../types/academy';
import { ErrorRetryCard, GlowSkeleton } from '../ui/CommonUI';

interface GlossaryToolProps {
  profile: UserProfile | null;
  cachedGlossary: Record<string, GlossaryEntry>;
  onCacheEntry: (termKey: string, entry: GlossaryEntry) => void;
}

export function GlossaryTool({
  profile,
  cachedGlossary,
  onCacheEntry,
}: GlossaryToolProps) {
  const [query, setQuery] = useState('');
  const [activeEntry, setActiveEntry] = useState<GlossaryEntry | null>(
    Object.values(cachedGlossary)[0] || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearched, setLastSearched] = useState('');

  const handleSearch = async (termInput: string) => {
    const clean = termInput.trim();
    if (!clean) return;
    setQuery(clean);
    setLastSearched(clean);
    setError(null);

    const key = clean.toLowerCase();
    if (cachedGlossary[key]) {
      setActiveEntry(cachedGlossary[key]);
      return;
    }

    setLoading(true);
    try {
      const entry = await lookupGlossaryTerm({ term: clean, profile });
      onCacheEntry(key, entry);
      setActiveEntry(entry);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mencari istilah. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const recentKeys = Object.values(cachedGlossary).slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-[#2F6BFF]/25 border border-[#5AA2FF]/35 flex items-center justify-center text-[#5AA2FF] shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-[#F4F7FF]">
              Kamus Istilah Kapal Pesiar
            </h2>
            <p className="mt-1 text-sm text-[#A9B8DB]">
              Cari istilah maritim & operasional kapal (misalnya Embarkation, Gangway, Bridge, Crew Mess, Sign-on, Sign-off). Hasil pencarian tersimpan otomatis.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5AA2FF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ketik istilah kapal (misal: Muster Station, Aft, Purser, USPH)..."
              className="w-full rounded-xl bg-[#07112B] border border-[#5A96FF]/35 pl-10 pr-4 py-3 min-h-[46px] text-sm text-[#F4F7FF] placeholder-[#6E82B0] focus:outline-none focus:border-[#FF7A1A]"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="cta-orange rounded-xl px-6 py-3 min-h-[46px] text-sm font-semibold text-white cursor-pointer disabled:opacity-45 whitespace-nowrap"
          >
            Cari Penjelasan AI
          </button>
        </form>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#A9B8DB]">Istilah Populer di Kapal</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_GLOSSARY_TERMS.map((term) => {
              const isCached = Boolean(cachedGlossary[term.toLowerCase()]);
              return (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearch(term)}
                  className={`rounded-xl px-3 py-1.5 min-h-[38px] text-xs font-medium border transition-colors cursor-pointer ${
                    activeEntry?.term.toLowerCase() === term.toLowerCase()
                      ? 'bg-[#2F6BFF]/30 border-[#FF7A1A] text-[#F4F7FF]'
                      : isCached
                        ? 'bg-[#0C244D]/80 border-[#5AA2FF]/45 text-[#D7E2FA]'
                        : 'bg-[#091432]/75 border-[#5A96FF]/20 text-[#A9B8DB] hover:border-[#5AA2FF]/50 hover:text-white'
                  }`}
                >
                  {term}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {error && (
        <ErrorRetryCard message={error} onRetry={() => handleSearch(lastSearched)} />
      )}

      {loading && (
        <GlowSkeleton
          title={`Mencari definisi "${lastSearched}"...`}
          subtitle="Senior Officer AI sedang menyiapkan arti, pelafalan, dan contoh penggunaannya di kapal."
          lines={3}
        />
      )}

      {activeEntry && !loading && (
        <section className="glass-card rounded-2xl p-6 sm:p-8 space-y-5 border-[#5AA2FF]/35">
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-[#5A96FF]/20">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#FFA24D]">
                {activeEntry.term}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-[#A9B8DB]">
                Pelafalan: <span className="text-[#F4F7FF]">{activeEntry.pronunciationHint}</span>
              </p>
            </div>
            <p className="text-xs text-[#5AA2FF]">
              {activeEntry.relatedDivisions.join(' · ')}
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-[#A9B8DB]">Arti Istilah</h4>
            <p className="text-sm sm:text-base text-[#F4F7FF] leading-relaxed">
              {activeEntry.shortDefinition}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#091432]/85 border border-[#5A96FF]/20 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-[#5AA2FF] flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Contoh Situasi di Kapal
              </p>
              <p className="text-sm text-[#D7E2FA] leading-relaxed">
                {activeEntry.shipContextExample}
              </p>
            </div>

            <div className="rounded-xl bg-[#0D1E4D]/75 border border-[#FFA24D]/30 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-[#FFA24D] flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                Tips untuk Kru Baru
              </p>
              <p className="text-sm text-[#E4ECFF] leading-relaxed">
                {activeEntry.newCrewTip}
              </p>
            </div>
          </div>
        </section>
      )}

      {recentKeys.length > 1 && (
        <section className="glass-card rounded-2xl p-5 space-y-3">
          <h3 className="font-display text-sm font-bold text-[#F4F7FF]">
            Riwayat Istilah Tersimpan ({recentKeys.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {recentKeys.map((entry) => (
              <button
                key={entry.term}
                type="button"
                onClick={() => setActiveEntry(entry)}
                className="text-left rounded-xl bg-[#091432]/75 border border-[#5A96FF]/20 hover:border-[#5AA2FF]/50 p-3.5 transition-colors cursor-pointer"
              >
                <p className="font-display text-sm font-bold text-[#FFA24D]">
                  {entry.term}
                </p>
                <p className="mt-0.5 text-xs text-[#A9B8DB] line-clamp-1">
                  {entry.shortDefinition}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
