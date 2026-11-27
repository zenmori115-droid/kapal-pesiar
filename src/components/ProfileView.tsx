import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Database,
  RotateCcw,
  Save,
  User,
} from 'lucide-react';
import { DIVISIONS, EXPERIENCE_LABELS } from '../data/divisions';
import { ExperienceLevel, UserProfile } from '../types/academy';

interface ProfileViewProps {
  profile: UserProfile | null;
  cachedGuidesCount: number;
  cachedModulesCount: number;
  cachedGlossaryCount: number;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetProgress: (keepProfile: boolean) => void;
}

export function ProfileView({
  profile,
  cachedGuidesCount,
  cachedModulesCount,
  cachedGlossaryCount,
  onUpdateProfile,
  onResetProgress,
}: ProfileViewProps) {
  const [name, setName] = useState(profile?.name || '');
  const [targetDivisionId, setTargetDivisionId] = useState(
    profile?.targetDivisionId || 'housekeeping'
  );
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    profile?.experienceLevel || 'pemula'
  );
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onUpdateProfile({
      name: trimmed,
      targetDivisionId,
      experienceLevel,
      onboarded: true,
      createdAt: profile?.createdAt || new Date().toISOString(),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7FF]">
          Profil Peserta & Pengaturan Lokal
        </h1>
        <p className="mt-1 text-sm text-[#A9B8DB]">
          Sesuaikan nama di sertifikat, divisi target, dan level pengalaman agar materi AI selalu relevan.
        </p>
      </div>

      {/* Edit Profile Form */}
      <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-[#2F6BFF]/25 border border-[#5AA2FF]/35 flex items-center justify-center text-[#FFA24D]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-[#F4F7FF]">
              Identitas Pelatihan
            </h2>
            <p className="text-xs text-[#A9B8DB]">
              Tersimpan lokal di browser ini tanpa memerlukan akun atau login.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="prof-name" className="block text-xs font-semibold text-[#A9B8DB]">
            Nama Panggilan (Ditampilkan di Sertifikat)
          </label>
          <input
            id="prof-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className="w-full rounded-xl bg-[#07112B] border border-[#5A96FF]/35 px-4 py-3 min-h-[46px] text-sm text-[#F4F7FF] focus:outline-none focus:border-[#FF7A1A]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="prof-div" className="block text-xs font-semibold text-[#A9B8DB]">
            Divisi yang Diminati
          </label>
          <select
            id="prof-div"
            value={targetDivisionId}
            onChange={(e) => setTargetDivisionId(e.target.value)}
            className="w-full rounded-xl bg-[#091432] border border-[#5A96FF]/35 px-4 py-3 min-h-[46px] text-sm text-[#F4F7FF] focus:outline-none focus:border-[#FF7A1A]"
          >
            {DIVISIONS.filter((d) => d.id !== 'mandatory').map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-semibold text-[#A9B8DB]">
            Level Pengalaman (Mempengaruhi Gaya Penjelasan & Kuis AI)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((key) => {
              const info = EXPERIENCE_LABELS[key];
              const active = experienceLevel === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setExperienceLevel(key)}
                  className={`text-left rounded-xl p-3.5 border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#2F6BFF]/25 border-[#FF7A1A] text-[#F4F7FF]'
                      : 'bg-[#091432]/70 border-[#5A96FF]/20 text-[#A9B8DB] hover:border-[#5AA2FF]/45'
                  }`}
                >
                  <p className="font-display text-sm font-semibold text-[#F4F7FF]">
                    {info.label}
                  </p>
                  <p className="mt-1 text-xs text-[#A9B8DB] leading-snug">
                    {info.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {savedNotice ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#34D399]">
              <Check className="w-4 h-4" />
              Profil berhasil diperbarui
            </span>
          ) : (
            <span className="text-xs text-[#8FA3CE]">
              Materi baru dari AI akan mengikuti profil terbaru.
            </span>
          )}

          <button
            type="submit"
            disabled={!name.trim()}
            className="cta-orange inline-flex items-center gap-2 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white cursor-pointer disabled:opacity-45"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </div>
      </form>

      {/* Local Cache Summary */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-[#5AA2FF]" />
          <h2 className="font-display text-lg font-bold text-[#F4F7FF]">
            Penyimpanan Lokal (Cache Materi AI)
          </h2>
        </div>
        <p className="text-sm text-[#A9B8DB] leading-relaxed">
          Materi Pedoman Kerja, Modul Pelatihan, dan Kamus yang sudah pernah dibuka otomatis tersimpan di perangkatmu agar lebih cepat diakses kembali.
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-[#091432]/80 border border-[#5A96FF]/20 p-3.5">
            <p className="font-display text-xl font-bold text-[#F4F7FF] tabular-nums">
              {cachedGuidesCount}
            </p>
            <p className="text-xs text-[#A9B8DB]">Pedoman Divisi</p>
          </div>
          <div className="rounded-xl bg-[#091432]/80 border border-[#5A96FF]/20 p-3.5">
            <p className="font-display text-xl font-bold text-[#F4F7FF] tabular-nums">
              {cachedModulesCount}
            </p>
            <p className="text-xs text-[#A9B8DB]">Modul Tersimpan</p>
          </div>
          <div className="rounded-xl bg-[#091432]/80 border border-[#5A96FF]/20 p-3.5">
            <p className="font-display text-xl font-bold text-[#F4F7FF] tabular-nums">
              {cachedGlossaryCount}
            </p>
            <p className="text-xs text-[#A9B8DB]">Istilah Kamus</p>
          </div>
        </div>
      </section>

      {/* Reset Progress Section */}
      <section className="glass-card rounded-2xl p-6 space-y-4 border-[#F87171]/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#FCA5A5] shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-lg font-bold text-[#F4F7FF]">
              Reset Progres Belajar
            </h2>
            <p className="mt-1 text-sm text-[#A9B8DB] leading-relaxed">
              Menghapus seluruh progres modul selesai, riwayat skor kuis, sertifikat, checklist tersimpan, dan cache materi AI di browser ini.
            </p>
          </div>
        </div>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 min-h-[44px] text-sm font-semibold text-[#FCA5A5] bg-[#3A1624]/70 border border-[#F87171]/40 hover:bg-[#4D1B2E]/80 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Progres
          </button>
        ) : (
          <div className="rounded-xl bg-[#3A1624]/60 border border-[#F87171]/45 p-4 space-y-3">
            <p className="text-sm font-medium text-[#FEF2F2]">
              Yakin ingin menghapus semua progres belajar dan skor kuis? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onResetProgress(true);
                  setConfirmReset(false);
                }}
                className="rounded-xl px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] cursor-pointer"
              >
                Ya, Reset Progres (Simpan Profil)
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetProgress(false);
                  setConfirmReset(false);
                }}
                className="rounded-xl px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold text-[#FCA5A5] bg-[#091432]/85 border border-[#F87171]/40 hover:bg-[#1A1228] cursor-pointer"
              >
                Reset Semua Termasuk Profil
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-xl px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-medium text-[#A9B8DB] hover:text-white cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
