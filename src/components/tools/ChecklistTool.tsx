import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Square,
  Trash2,
} from 'lucide-react';
import {
  CHECKLIST_SITUATIONS,
  DIVISIONS,
  getDivisionById,
} from '../../data/divisions';
import { generateChecklist } from '../../services/aiClient';
import { SavedChecklist, UserProfile } from '../../types/academy';
import {
  ErrorRetryCard,
  GlowSkeleton,
  ProgressBar,
  ShareActions,
} from '../ui/CommonUI';

interface ChecklistToolProps {
  profile: UserProfile | null;
  savedChecklists: SavedChecklist[];
  onSaveChecklist: (cl: SavedChecklist) => void;
  onToggleItem: (checklistId: string, itemId: string) => void;
  onDeleteChecklist: (checklistId: string) => void;
}

export function ChecklistTool({
  profile,
  savedChecklists,
  onSaveChecklist,
  onToggleItem,
  onDeleteChecklist,
}: ChecklistToolProps) {
  const [divisionId, setDivisionId] = useState(
    profile?.targetDivisionId || 'mandatory'
  );
  const [situation, setSituation] = useState(CHECKLIST_SITUATIONS[0]);
  const [customSituation, setCustomSituation] = useState('');
  const [activeId, setActiveId] = useState<string | null>(
    savedChecklists[0]?.id || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeChecklist =
    savedChecklists.find((c) => c.id === activeId) || savedChecklists[0] || null;

  const handleGenerate = async () => {
    const finalSituation =
      situation === '__custom__' ? customSituation.trim() : situation;
    if (!finalSituation) {
      setError('Tuliskan situasi persiapan terlebih dahulu.');
      return;
    }

    const div = getDivisionById(divisionId);
    setLoading(true);
    setError(null);
    try {
      const res = await generateChecklist({
        divisionName: div.name,
        situation: finalSituation,
        profile,
      });

      const id = `cl-${Date.now()}`;
      const newChecklist: SavedChecklist = {
        id,
        divisionId: div.id,
        divisionName: div.shortName,
        situation: finalSituation,
        title: res.title || `Checklist ${finalSituation}`,
        categories: (res.categories || []).map((cat, cIdx) => ({
          category: cat.category,
          items: (cat.items || []).map((item, iIdx) => ({
            id: `${id}-${cIdx}-${iIdx}`,
            text: item.text,
            note: item.note,
            checked: false,
          })),
        })),
        createdAt: new Date().toISOString(),
      };
      onSaveChecklist(newChecklist);
      setActiveId(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal membuat checklist. Coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const calcStats = (cl: SavedChecklist) => {
    const all = cl.categories.flatMap((c) => c.items);
    const checked = all.filter((i) => i.checked).length;
    const percent = all.length > 0 ? Math.round((checked / all.length) * 100) : 0;
    return { total: all.length, checked, percent };
  };

  const buildShareText = (cl: SavedChecklist) => {
    const st = calcStats(cl);
    const lines = cl.categories.flatMap((cat) => [
      `\n[${cat.category}]`,
      ...cat.items.map((it) => `${it.checked ? '[x]' : '[ ]'} ${it.text}`),
    ]);
    return `${cl.title} (${cl.divisionName}) — ${st.checked}/${st.total} selesai (${st.percent}%)${lines.join(
      '\n'
    )}\n\nDibuat di CruiseCrew Academy`;
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <section className="glass-card rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="font-display text-xl font-bold text-[#F4F7FF]">
            Generator Checklist Persiapan Kru
          </h2>
          <p className="mt-1 text-sm text-[#A9B8DB]">
            Pilih divisi dan situasi — AI akan menyusun daftar persiapan praktis yang bisa dicentang dan tersimpan otomatis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="cl-div" className="block text-xs font-semibold text-[#A9B8DB]">
              Divisi
            </label>
            <select
              id="cl-div"
              value={divisionId}
              onChange={(e) => setDivisionId(e.target.value)}
              className="w-full rounded-xl bg-[#091432] border border-[#5A96FF]/35 px-4 py-3 min-h-[46px] text-sm text-[#F4F7FF] focus:outline-none focus:border-[#FF7A1A]"
            >
              {DIVISIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="cl-sit" className="block text-xs font-semibold text-[#A9B8DB]">
              Situasi / Momen
            </label>
            <select
              id="cl-sit"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="w-full rounded-xl bg-[#091432] border border-[#5A96FF]/35 px-4 py-3 min-h-[46px] text-sm text-[#F4F7FF] focus:outline-none focus:border-[#FF7A1A]"
            >
              {CHECKLIST_SITUATIONS.map((sit) => (
                <option key={sit} value={sit}>
                  {sit}
                </option>
              ))}
              <option value="__custom__">Situasi lainnya (tulis sendiri)...</option>
            </select>
          </div>
        </div>

        {situation === '__custom__' && (
          <input
            type="text"
            value={customSituation}
            onChange={(e) => setCustomSituation(e.target.value)}
            placeholder="Contoh: Persiapan pindah kapal / audit USPH mendadak di bar..."
            className="w-full rounded-xl bg-[#07112B] border border-[#5A96FF]/35 px-4 py-3 min-h-[46px] text-sm text-[#F4F7FF] placeholder-[#6E82B0] focus:outline-none focus:border-[#FF7A1A]"
          />
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="cta-orange inline-flex items-center gap-2 rounded-xl px-6 py-3 min-h-[46px] text-sm font-semibold text-white cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Buat Checklist AI
        </button>
      </section>

      {error && <ErrorRetryCard message={error} onRetry={handleGenerate} />}

      {loading && (
        <GlowSkeleton
          title="Menyusun Checklist Persiapan..."
          subtitle="Mengelompokkan dokumen, perlengkapan, dan kesiapan operasional sesuai divisimu."
          lines={5}
        />
      )}

      {/* Saved Checklists Tabs */}
      {savedChecklists.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {savedChecklists.map((cl) => {
            const isSelected = activeChecklist?.id === cl.id;
            const st = calcStats(cl);
            return (
              <button
                key={cl.id}
                type="button"
                onClick={() => setActiveId(cl.id)}
                className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-medium border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-[#2F6BFF]/30 border-[#FF7A1A] text-[#F4F7FF]'
                    : 'bg-[#091432]/75 border-[#5A96FF]/20 text-[#A9B8DB] hover:text-[#F4F7FF]'
                }`}
              >
                {cl.divisionName} · {st.percent}%
              </button>
            );
          })}
        </div>
      )}

      {/* Active Interactive Checklist */}
      {activeChecklist && !loading && (
        <section className="glass-card rounded-2xl p-6 space-y-6">
          {(() => {
            const st = calcStats(activeChecklist);
            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#FFA24D]">
                      {activeChecklist.divisionName} · {activeChecklist.situation}
                    </p>
                    <h3 className="font-display text-xl font-bold text-[#F4F7FF]">
                      {activeChecklist.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <ShareActions
                      shareText={buildShareText(activeChecklist)}
                      label="Bagikan ke"
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteChecklist(activeChecklist.id)}
                      aria-label="Hapus checklist"
                      className="h-11 w-11 rounded-xl bg-[#091432]/80 border border-[#5A96FF]/25 hover:border-[#F87171]/50 text-[#A9B8DB] hover:text-[#FCA5A5] flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#A9B8DB] tabular-nums">
                    <span>Progres Persiapan</span>
                    <span className="font-semibold text-[#F4F7FF]">
                      {st.checked}/{st.total} selesai ({st.percent}%)
                    </span>
                  </div>
                  <ProgressBar value={st.percent} heightClass="h-2.5" />
                </div>

                <div className="space-y-5">
                  {activeChecklist.categories.map((cat, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <h4 className="font-display text-sm sm:text-base font-bold text-[#5AA2FF]">
                        {cat.category}
                      </h4>
                      <div className="space-y-2">
                        {cat.items.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => onToggleItem(activeChecklist.id, item.id)}
                            className={`w-full text-left rounded-xl p-3.5 min-h-[52px] border transition-all flex items-start gap-3 cursor-pointer ${
                              item.checked
                                ? 'bg-[#0C2F27]/55 border-[#34D399]/35'
                                : 'bg-[#091432]/75 border-[#5A96FF]/20 hover:border-[#5AA2FF]/50'
                            }`}
                          >
                            {item.checked ? (
                              <CheckSquare className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
                            ) : (
                              <Square className="w-5 h-5 text-[#5AA2FF] shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p
                                className={`text-sm font-medium leading-snug ${
                                  item.checked
                                    ? 'line-through text-[#8FCFB9]'
                                    : 'text-[#F4F7FF]'
                                }`}
                              >
                                {item.text}
                              </p>
                              <p className="mt-0.5 text-xs text-[#A9B8DB] leading-relaxed">
                                {item.note}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </section>
      )}
    </div>
  );
}
