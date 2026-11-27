import React, { useState } from 'react';
import { Anchor, ArrowRight, Check } from 'lucide-react';
import { DIVISIONS, EXPERIENCE_LABELS } from '../data/divisions';
import { ExperienceLevel, UserProfile } from '../types/academy';
import { DivisionIcon } from './ui/CommonUI';

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [name, setName] = useState('');
  const [targetDivisionId, setTargetDivisionId] = useState('housekeeping');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('pemula');
  const [error, setError] = useState('');

  const selectableDivisions = DIVISIONS.filter((d) => d.id !== 'mandatory');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Masukkan nama panggilanmu terlebih dahulu.');
      return;
    }
    onComplete({
      name: trimmed,
      targetDivisionId,
      experienceLevel,
      onboarded: true,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030715]/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="glass-card w-full max-w-2xl rounded-2xl p-6 sm:p-8 my-auto border-[#5AA2FF]/35 shadow-[0_0_50px_rgba(47,107,255,0.3)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#FF7A1A] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,122,26,0.4)]">
            <Anchor className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#FFA24D]">
              Selamat Datang di CruiseCrew Academy
            </p>
            <h2
              id="onboarding-title"
              className="font-display text-xl sm:text-2xl font-bold text-[#F4F7FF]"
            >
              Atur Profil Pelatihanmu
            </h2>
          </div>
        </div>

        <p className="text-sm text-[#A9B8DB] mb-6 leading-relaxed">
          Senior Training Officer AI akan menyesuaikan kedalaman materi, contoh kasus di kapal, dan tingkat kesulitan kuis berdasarkan profilmu.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Nama Panggilan */}
          <div>
            <label
              htmlFor="crew-name"
              className="block text-sm font-semibold text-[#F4F7FF] mb-2"
            >
              1. Nama Panggilan
            </label>
            <input
              id="crew-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Contoh: Bima, Sari, Dimas..."
              maxLength={40}
              className="w-full rounded-xl bg-[#07112B]/90 border border-[#5A96FF]/35 px-4 py-3 min-h-[46px] text-sm text-[#F4F7FF] placeholder-[#6E82B0] focus:outline-none focus:border-[#FF7A1A] focus:ring-2 focus:ring-[#FF7A1A]/30 transition-all"
              autoFocus
            />
            {error && <p className="mt-1.5 text-xs text-[#FCA5A5]">{error}</p>}
          </div>

          {/* 2. Level Pengalaman */}
          <div>
            <span className="block text-sm font-semibold text-[#F4F7FF] mb-2">
              2. Level Pengalaman Saat Ini
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(EXPERIENCE_LABELS) as ExperienceLevel[]).map((levelKey) => {
                const info = EXPERIENCE_LABELS[levelKey];
                const active = experienceLevel === levelKey;
                return (
                  <button
                    key={levelKey}
                    type="button"
                    onClick={() => setExperienceLevel(levelKey)}
                    className={`text-left rounded-xl p-3.5 min-h-[44px] border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#2F6BFF]/25 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,0.28)]'
                        : 'bg-[#091432]/70 border-[#5A96FF]/20 hover:border-[#5AA2FF]/45'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-[#F4F7FF]">
                        {info.label}
                      </span>
                      {active && <Check className="w-4 h-4 text-[#FFA24D] shrink-0" />}
                    </div>
                    <p className="mt-1 text-xs text-[#A9B8DB] leading-snug">
                      {info.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Divisi Diminati */}
          <div>
            <span className="block text-sm font-semibold text-[#F4F7FF] mb-2">
              3. Divisi yang Paling Diminati
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
              {selectableDivisions.map((div) => {
                const active = targetDivisionId === div.id;
                return (
                  <button
                    key={div.id}
                    type="button"
                    onClick={() => setTargetDivisionId(div.id)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 min-h-[46px] text-left border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#2F6BFF]/25 border-[#FF7A1A] shadow-[0_0_16px_rgba(255,122,26,0.25)]'
                        : 'bg-[#091432]/65 border-[#5A96FF]/20 hover:border-[#5AA2FF]/45'
                    }`}
                  >
                    <span
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        active
                          ? 'bg-[#FF7A1A]/20 text-[#FFA24D]'
                          : 'bg-[#2F6BFF]/20 text-[#5AA2FF]'
                      }`}
                    >
                      <DivisionIcon name={div.iconName} className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#F4F7FF] truncate">
                        {div.shortName}
                      </p>
                      <p className="text-xs text-[#A9B8DB] truncate">
                        {div.roles.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#5A96FF]/20">
            <p className="text-xs text-[#A9B8DB]">
              Data disimpan lokal di perangkatmu. Bisa diubah kapan saja di menu Profil.
            </p>
            <button
              type="submit"
              className="cta-orange inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 min-h-[46px] text-sm font-semibold text-white cursor-pointer whitespace-nowrap"
            >
              Mulai Pelatihan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
