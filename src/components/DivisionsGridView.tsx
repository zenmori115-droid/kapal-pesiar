import React, { useMemo, useState } from 'react';
import { Award, Search } from 'lucide-react';
import { DIVISIONS } from '../data/divisions';
import { Division, DivisionTab, UserProfile } from '../types/academy';
import { DivisionIcon, ProgressBar } from './ui/CommonUI';

interface DivisionsGridViewProps {
  profile: UserProfile | null;
  getDivisionProgress: (divisionId: string) => {
    total: number;
    completed: number;
    percent: number;
    bestFinalScore: number | null;
    passedFinal: boolean;
    hasCertificate: boolean;
  };
  onOpenDivision: (divisionId: string, tab?: DivisionTab) => void;
}

type FilterKey = 'all' | Division['category'];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Semua (12)' },
  { key: 'mandatory', label: 'Wajib Semua Kru' },
  { key: 'hotel', label: 'Hotel & F&B' },
  { key: 'technical', label: 'Deck & Engine' },
  { key: 'safety', label: 'Safety & Medical' },
];

export function DivisionsGridView({
  profile,
  getDivisionProgress,
  onOpenDivision,
}: DivisionsGridViewProps) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DIVISIONS.filter((d) => {
      const matchCat = filter === 'all' || d.category === filter;
      const matchQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.roles.some((r) => r.toLowerCase().includes(q));
      return matchCat && matchQuery;
    });
  }, [filter, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7FF]">
            Katalog Divisi Kapal Pesiar
          </h1>
          <p className="mt-1 text-sm text-[#A9B8DB]">
            Pilih divisi untuk mempelajari Pedoman Kerja, Learning Path, Kuis, dan Simulasi Role-Play.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#5AA2FF] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari divisi atau posisi (misal: Waiter)..."
            className="w-full rounded-xl bg-[#091432]/85 border border-[#5A96FF]/30 pl-10 pr-4 py-2.5 min-h-[44px] text-sm text-[#F4F7FF] placeholder-[#7B90BE] focus:outline-none focus:border-[#FF7A1A]"
          />
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 min-h-[44px] rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                active
                  ? 'bg-[#FF7A1A]/20 border-[#FF7A1A] text-[#FFA24D] shadow-[0_0_16px_rgba(255,122,26,0.28)]'
                  : 'bg-[#0C1B44]/65 border-[#5A96FF]/20 text-[#A9B8DB] hover:text-[#F4F7FF] hover:border-[#5AA2FF]/45'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Division Cards */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="font-display text-base font-semibold text-[#F4F7FF]">
            Divisi atau posisi tidak ditemukan
          </p>
          <p className="mt-1 text-sm text-[#A9B8DB]">
            Coba kata kunci lain seperti Housekeeping, Bar, Galley, Deck, atau Engine.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((div) => {
            const prog = getDivisionProgress(div.id);
            const isMandatory = div.id === 'mandatory';
            const isTarget = profile?.targetDivisionId === div.id;
            return (
              <div
                key={div.id}
                className={`glass-card glass-card-interactive rounded-2xl p-5 flex flex-col justify-between ${
                  isMandatory || isTarget ? 'border-[#FF7A1A]/45' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                        isMandatory || isTarget
                          ? 'bg-[#FF7A1A]/20 border-[#FF7A1A]/45 text-[#FFA24D]'
                          : 'bg-[#2F6BFF]/22 border-[#5AA2FF]/35 text-[#5AA2FF]'
                      }`}
                    >
                      <DivisionIcon name={div.iconName} className="w-5 h-5" />
                    </div>

                    <div className="text-right text-xs tabular-nums">
                      {prog.hasCertificate ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#34D399]">
                          <Award className="w-3.5 h-3.5" />
                          Sertifikat Diraih
                        </span>
                      ) : isMandatory ? (
                        <span className="font-semibold text-[#FFA24D]">Wajib Dasar</span>
                      ) : isTarget ? (
                        <span className="font-semibold text-[#FFA24D]">Targetmu</span>
                      ) : (
                        <span className="text-[#A9B8DB]">{div.modules.length} modul</span>
                      )}
                    </div>
                  </div>

                  <h2 className="mt-4 font-display text-lg font-bold text-[#F4F7FF]">
                    {div.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#5AA2FF]">{div.roles.join(' · ')}</p>
                  <p className="mt-2 text-sm text-[#A9B8DB] leading-relaxed">
                    {div.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[#5A96FF]/15 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-[#A9B8DB] tabular-nums">
                      <span>
                        {prog.completed}/{prog.total} modul selesai
                      </span>
                      <span className="font-semibold text-[#F4F7FF]">{prog.percent}%</span>
                    </div>
                    <ProgressBar value={prog.percent} heightClass="h-1.5" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenDivision(div.id, 'guide')}
                      className="rounded-xl px-3 py-2 min-h-[42px] text-xs font-medium text-[#F4F7FF] bg-[#142864]/65 border border-[#5A96FF]/30 hover:border-[#5AA2FF]/60 transition-colors cursor-pointer"
                    >
                      Pedoman Kerja
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDivision(div.id, 'training')}
                      className="cta-orange rounded-xl px-3 py-2 min-h-[42px] text-xs font-semibold text-white cursor-pointer"
                    >
                      Mulai Pelatihan
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
