import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckSquare,
  Compass,
  Flame,
  MessageSquare,
  Play,
  Search,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { ASSETS, DIVISIONS, getDivisionById } from '../data/divisions';
import { DivisionTab, ToolMode, UserProfile } from '../types/academy';
import { DivisionIcon, ProgressBar } from './ui/CommonUI';

interface DashboardViewProps {
  profile: UserProfile | null;
  stats: {
    totalModules: number;
    completedCount: number;
    averageScore: number;
    streakDays: number;
    activeDivisionsCount: number;
    certificatesCount: number;
  };
  lastActivity: {
    divisionId: string;
    moduleId?: string;
    tab?: DivisionTab;
    updatedAt: string;
  } | null;
  getDivisionProgress: (divisionId: string) => {
    total: number;
    completed: number;
    percent: number;
    bestFinalScore: number | null;
    passedFinal: boolean;
    hasCertificate: boolean;
  };
  onOpenDivision: (divisionId: string, tab?: DivisionTab, moduleId?: string) => void;
  onOpenTool: (tool: ToolMode) => void;
  onOpenAllDivisions: () => void;
}

export function DashboardView({
  profile,
  stats,
  lastActivity,
  getDivisionProgress,
  onOpenDivision,
  onOpenTool,
  onOpenAllDivisions,
}: DashboardViewProps) {
  const mandatoryDivision = getDivisionById('mandatory');
  const mandatoryProgress = getDivisionProgress('mandatory');
  const operationalDivisions = DIVISIONS.filter((d) => d.id !== 'mandatory');

  const continueDivisionId =
    lastActivity?.divisionId || profile?.targetDivisionId || 'mandatory';
  const continueDivision = getDivisionById(continueDivisionId);
  const continueModule =
    (lastActivity?.moduleId &&
      continueDivision.modules.find((m) => m.id === lastActivity.moduleId)) ||
    continueDivision.modules[0];
  const continueProgress = getDivisionProgress(continueDivision.id);

  const statItems = [
    {
      label: 'Modul Selesai',
      value: `${stats.completedCount}/${stats.totalModules}`,
      sub: 'Total kurikulum tersedia',
      icon: BookOpen,
      accent: 'text-[#5AA2FF]',
    },
    {
      label: 'Rata-rata Skor Kuis',
      value: stats.averageScore > 0 ? `${stats.averageScore}%` : '—',
      sub: 'Target kelulusan 70%',
      icon: Target,
      accent: 'text-[#34D399]',
    },
    {
      label: 'Streak Belajar',
      value: `${stats.streakDays} Hari`,
      sub: 'Konsistensi harian',
      icon: Flame,
      accent: 'text-[#FFA24D]',
    },
    {
      label: 'Divisi Aktif',
      value: `${stats.activeDivisionsCount}`,
      sub: `${stats.certificatesCount} sertifikat diraih`,
      icon: Compass,
      accent: 'text-[#5AA2FF]',
    },
  ];

  const toolkitCards: {
    mode: ToolMode;
    title: string;
    desc: string;
    icon: React.ElementType;
  }[] = [
    {
      mode: 'senior-chat',
      title: 'Tanya Senior AI',
      desc: 'Diskusi bebas kehidupan kru, Crew Mess, dokumen & adaptasi',
      icon: MessageSquare,
    },
    {
      mode: 'checklist',
      title: 'Generator Checklist',
      desc: 'Checklist persiapan sign-on, wawancara & hari pertama',
      icon: CheckSquare,
    },
    {
      mode: 'interview',
      title: 'Simulasi Wawancara',
      desc: 'Latihan 6 pertanyaan recruiter kapal pesiar + skor feedback',
      icon: Briefcase,
    },
    {
      mode: 'glossary',
      title: 'Kamus Istilah Kapal',
      desc: 'Cari arti Gangway, Muster Drill, Embarkation, Bridge & lainnya',
      icon: Search,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Banner with Night Cruise Ship & Ocean Wave */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-2xl border border-[#5A96FF]/30 shadow-[0_0_36px_rgba(47,107,255,0.24)] min-h-[300px] sm:min-h-[340px] flex items-end"
      >
        <img
          src={ASSETS.heroCruiseShip}
          alt="Kapal pesiar mewah berlayar di laut malam"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(100deg, rgba(5, 11, 31, 0.94) 0%, rgba(10, 20, 51, 0.8) 52%, rgba(13, 27, 74, 0.45) 100%)',
          }}
        />

        <div className="relative z-10 w-full p-6 sm:p-10 pb-12 sm:pb-14 max-w-3xl">
          <p className="text-xs sm:text-sm font-medium text-[#FFA24D] mb-2">
            {profile?.name
              ? `Halo, ${profile.name} · Siap tingkatkan kompetensimu?`
              : 'Akademi Pelatihan Kru Kapal Pesiar Indonesia'}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F4F7FF] tracking-tight leading-[1.12] hero-title-glow text-balance">
            Siapkan Dirimu untuk Berlayar
          </h1>
          <p className="mt-3.5 text-sm sm:text-base text-[#D3E0FF] max-w-xl leading-relaxed">
            Pedoman kerja per divisi, modul pelatihan berbasis standar internasional, kuis ujian, hingga simulasi role-play bersama Senior Training Officer AI.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenDivision(continueDivision.id, 'training', continueModule.id)}
              className="cta-orange inline-flex items-center gap-2.5 rounded-xl px-6 py-3 min-h-[48px] text-sm sm:text-base font-semibold text-white cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              Mulai Belajar
            </button>

            <button
              type="button"
              onClick={() => onOpenTool('interview')}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 min-h-[48px] text-sm font-medium text-[#F4F7FF] bg-[#0D1B4A]/75 backdrop-blur-md border border-[#5AA2FF]/35 hover:border-[#5AA2FF]/70 hover:bg-[#142864]/80 transition-colors cursor-pointer whitespace-nowrap"
            >
              Latihan Wawancara
              <ArrowRight className="w-4 h-4 text-[#5AA2FF]" />
            </button>
          </div>
        </div>

        {/* Subtle Ocean Wave Pattern at Bottom of Hero */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-full h-10 sm:h-12 text-[#07112C]/80"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0,48 C240,86 480,10 720,46 C960,82 1200,16 1440,52 L1440,80 L0,80 Z"
          />
          <path
            fill="none"
            stroke="rgba(90, 162, 255, 0.35)"
            strokeWidth="1.5"
            d="M0,48 C240,86 480,10 720,46 C960,82 1200,16 1440,52"
          />
        </svg>
      </motion.section>

      {/* 4-Column KPI Stats Row */}
      <section aria-label="Ringkasan statistik belajar">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {statItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="glass-card rounded-2xl p-4 sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#A9B8DB]">{item.label}</span>
                  <Icon className={`w-4 h-4 shrink-0 ${item.accent}`} />
                </div>
                <p className="mt-2.5 font-display text-2xl sm:text-3xl font-bold text-[#F4F7FF] tabular-nums">
                  {item.value}
                </p>
                <p className="mt-1 text-xs text-[#8FA3CE]">{item.sub}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Continue Learning + Mandatory Foundation Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Lanjutkan Belajar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.1 }}
          className="lg:col-span-7 glass-card rounded-2xl p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-[#FFA24D]">
                {lastActivity ? 'Lanjutkan Belajar' : 'Rekomendasi Modul Pertama'}
              </span>
              <span className="text-xs text-[#A9B8DB] tabular-nums">
                {continueProgress.completed}/{continueProgress.total} modul · {continueProgress.percent}%
              </span>
            </div>

            <div className="mt-4 flex items-start gap-4">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-[#2F6BFF]/25 border border-[#5AA2FF]/35 flex items-center justify-center text-[#5AA2FF]">
                <DivisionIcon name={continueDivision.iconName} className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[#A9B8DB]">{continueDivision.name}</p>
                <h2 className="mt-0.5 font-display text-lg sm:text-xl font-bold text-[#F4F7FF] leading-snug">
                  {continueModule.title}
                </h2>
                <p className="mt-1.5 text-sm text-[#A9B8DB] leading-relaxed">
                  {continueModule.summary}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <ProgressBar value={continueProgress.percent} heightClass="h-2.5" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[#A9B8DB]">
                {continueModule.levelLabel} · Estimasi {continueModule.estimatedMinutes} menit
              </span>
              <button
                type="button"
                onClick={() =>
                  onOpenDivision(
                    continueDivision.id,
                    lastActivity?.tab || 'training',
                    continueModule.id
                  )
                }
                className="cta-orange inline-flex items-center gap-2 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white cursor-pointer whitespace-nowrap"
              >
                Buka Modul
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Wajib untuk Semua Kru Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.14 }}
          onClick={() => onOpenDivision('mandatory', 'training')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenDivision('mandatory', 'training');
            }
          }}
          className="lg:col-span-5 relative overflow-hidden rounded-2xl border border-[#FF7A1A]/35 shadow-[0_0_26px_rgba(255,122,26,0.18)] hover:border-[#FFA24D]/70 transition-all cursor-pointer flex flex-col justify-end min-h-[250px] group"
        >
          <img
            src={ASSETS.safetyBanner}
            alt="Dek muster station dan sekoci keselamatan kapal pesiar"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(5, 11, 31, 0.35) 0%, rgba(5, 11, 31, 0.86) 55%, rgba(5, 11, 31, 0.96) 100%)',
            }}
          />

          <div className="relative z-10 p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FFA24D]">
              <ShieldAlert className="w-4 h-4" />
              <span>Fondasi Utama · 7 Modul Wajib</span>
            </div>
            <h2 className="font-display text-xl font-bold text-[#F4F7FF]">
              {mandatoryDivision.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#D3E0FF] leading-relaxed">
              Muster Drill, alarm darurat, sanitasi USPH, budaya multikultural, MLC 2006, dan Bahasa Inggris dasar kapal.
            </p>
            <div className="pt-1 space-y-2">
              <div className="flex items-center justify-between text-xs text-[#A9B8DB] tabular-nums">
                <span>Progres Dasar</span>
                <span>
                  {mandatoryProgress.completed}/{mandatoryProgress.total} ({mandatoryProgress.percent}%)
                </span>
              </div>
              <ProgressBar value={mandatoryProgress.percent} heightClass="h-2" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* AI Companion Toolkit */}
      <section aria-label="Alat Latihan AI">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#F4F7FF]">
              Alat Latihan & Persiapan AI
            </h2>
            <p className="text-sm text-[#A9B8DB]">
              Latih wawancara, buat checklist sign-on, atau tanya langsung ke Senior Training Officer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {toolkitCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.mode}
                type="button"
                onClick={() => onOpenTool(card.mode)}
                className="glass-card glass-card-interactive rounded-2xl p-5 text-left flex flex-col justify-between cursor-pointer min-h-[140px]"
              >
                <div className="h-10 w-10 rounded-xl bg-[#2F6BFF]/25 border border-[#5AA2FF]/35 flex items-center justify-center text-[#FFA24D]">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mt-4">
                  <h3 className="font-display text-base font-semibold text-[#F4F7FF] flex items-center justify-between gap-2">
                    <span>{card.title}</span>
                    <ArrowRight className="w-4 h-4 text-[#5AA2FF] shrink-0" />
                  </h3>
                  <p className="mt-1 text-xs text-[#A9B8DB] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Pilihan 11 Divisi */}
      <section aria-label="Pilihan Divisi Kapal Pesiar">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F4F7FF]">
              Pilihan Divisi Kapal Pesiar
            </h2>
            <p className="text-sm text-[#A9B8DB] mt-0.5">
              11 divisi operasional lengkap dengan Pedoman Kerja, Learning Path, Kuis & Role-Play AI.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAllDivisions}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5AA2FF] hover:text-[#FFA24D] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
          >
            Lihat & Filter Semua
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {operationalDivisions.map((div, idx) => {
            const prog = getDivisionProgress(div.id);
            const isTarget = profile?.targetDivisionId === div.id;
            return (
              <motion.button
                key={div.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.25) }}
                onClick={() => onOpenDivision(div.id, 'guide')}
                className={`glass-card glass-card-interactive rounded-2xl p-5 text-left flex flex-col justify-between cursor-pointer ${
                  isTarget ? 'border-[#FF7A1A]/50' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
                        isTarget
                          ? 'bg-[#FF7A1A]/20 border-[#FF7A1A]/45 text-[#FFA24D]'
                          : 'bg-[#2F6BFF]/22 border-[#5AA2FF]/30 text-[#5AA2FF]'
                      }`}
                    >
                      <DivisionIcon name={div.iconName} className="w-5 h-5" />
                    </div>

                    <div className="text-right text-xs text-[#A9B8DB] tabular-nums">
                      {prog.hasCertificate ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#34D399]">
                          <Award className="w-3.5 h-3.5" />
                          Lulus
                        </span>
                      ) : isTarget ? (
                        <span className="font-semibold text-[#FFA24D]">Target Utama</span>
                      ) : (
                        <span>{div.modules.length} modul</span>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-4 font-display text-base sm:text-lg font-bold text-[#F4F7FF] leading-snug">
                    {div.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#5AA2FF]">
                    {div.roles.join(' · ')}
                  </p>
                  <p className="mt-2 text-xs sm:text-sm text-[#A9B8DB] leading-relaxed line-clamp-2">
                    {div.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#5A96FF]/15 space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#A9B8DB] tabular-nums">
                    <span>
                      {prog.completed}/{prog.total} modul selesai
                    </span>
                    <span className="font-semibold text-[#F4F7FF]">{prog.percent}%</span>
                  </div>
                  <ProgressBar value={prog.percent} heightClass="h-1.5" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
