import React from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Flame,
  Lock,
  Target,
} from 'lucide-react';
import { DIVISIONS } from '../data/divisions';
import {
  CertificateRecord,
  DivisionTab,
  QuizAttempt,
} from '../types/academy';
import { DivisionIcon, ProgressBar, ShareActions } from './ui/CommonUI';

interface ProgressViewProps {
  stats: {
    totalModules: number;
    completedCount: number;
    averageScore: number;
    streakDays: number;
    activeDivisionsCount: number;
    certificatesCount: number;
  };
  quizAttempts: QuizAttempt[];
  certificates: Record<string, CertificateRecord>;
  getDivisionProgress: (divisionId: string) => {
    total: number;
    completed: number;
    percent: number;
    bestFinalScore: number | null;
    passedFinal: boolean;
    hasCertificate: boolean;
  };
  onOpenDivision: (divisionId: string, tab?: DivisionTab) => void;
  onOpenCertificate: (divisionId: string) => void;
}

export function ProgressView({
  stats,
  quizAttempts,
  certificates,
  getDivisionProgress,
  onOpenDivision,
  onOpenCertificate,
}: ProgressViewProps) {
  const earnedList = Object.values(certificates);
  const overallPercent =
    stats.totalModules > 0
      ? Math.round((stats.completedCount / stats.totalModules) * 100)
      : 0;

  const summaryShareText = `Progres Belajarku di CruiseCrew Academy:\n- Modul selesai: ${stats.completedCount}/${stats.totalModules} (${overallPercent}%)\n- Rata-rata skor kuis: ${
    stats.averageScore > 0 ? `${stats.averageScore}%` : 'Belum ada'
  }\n- Streak belajar: ${stats.streakDays} hari\n- Sertifikat diraih: ${stats.certificatesCount}\nSiap berlayar bersama CruiseCrew Academy!`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7FF]">
            Progres & Sertifikat Belajar
          </h1>
          <p className="mt-1 text-sm text-[#A9B8DB]">
            Pantau pencapaian modul per divisi, riwayat skor kuis, dan cetak sertifikat penyelesaianmu.
          </p>
        </div>
        <ShareActions shareText={summaryShareText} label="Bagikan Progres ke" />
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A9B8DB]">
            <span>Total Penyelesaian Kurikulum</span>
            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          </div>
          <p className="font-display text-3xl font-extrabold text-[#F4F7FF] tabular-nums">
            {overallPercent}%
          </p>
          <ProgressBar value={overallPercent} heightClass="h-2" />
          <p className="text-xs text-[#8FA3CE] tabular-nums">
            {stats.completedCount} dari {stats.totalModules} modul selesai
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A9B8DB]">
            <span>Rata-rata Skor Kuis & Ujian</span>
            <Target className="w-4 h-4 text-[#5AA2FF]" />
          </div>
          <p className="font-display text-3xl font-extrabold text-[#F4F7FF] tabular-nums">
            {stats.averageScore > 0 ? `${stats.averageScore}%` : '—'}
          </p>
          <p className="text-xs text-[#8FA3CE] tabular-nums">
            Dari {quizAttempts.length} percobaan kuis/ujian
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#A9B8DB]">
            <span>Streak & Sertifikat</span>
            <Flame className="w-4 h-4 text-[#FFA24D]" />
          </div>
          <p className="font-display text-3xl font-extrabold text-[#FFA24D] tabular-nums">
            {stats.streakDays} Hari
          </p>
          <p className="text-xs text-[#8FA3CE] tabular-nums">
            {earnedList.length} sertifikat digital siap dicetak
          </p>
        </div>
      </div>

      {/* Earned Certificates Section */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-[#FFA24D]" />
          <div>
            <h2 className="font-display text-lg font-bold text-[#F4F7FF]">
              Sertifikat Penyelesaian Digital
            </h2>
            <p className="text-xs text-[#A9B8DB]">
              Terbuka otomatis setelah seluruh modul sebuah divisi selesai dan Ujian Akhir (20 soal) lulus minimal 70%.
            </p>
          </div>
        </div>

        {earnedList.length === 0 ? (
          <div className="rounded-xl bg-[#091432]/75 border border-[#5A96FF]/20 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#5AA2FF] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#F4F7FF]">
                  Belum ada sertifikat yang terbuka
                </p>
                <p className="mt-0.5 text-xs text-[#A9B8DB] leading-relaxed">
                  Selesaikan seluruh modul pada satu divisi lalu lulus Ujian Akhir 20 soal untuk membuka sertifikat digital yang bisa disimpan sebagai PDF.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenDivision('mandatory', 'training')}
              className="cta-orange shrink-0 rounded-xl px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
            >
              Mulai dari Wajib Semua Kru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {earnedList.map((cert) => (
              <div
                key={cert.divisionId}
                className="rounded-xl bg-gradient-to-br from-[#0E2052]/90 to-[#14295E]/70 border border-[#FFA24D]/45 p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-semibold text-[#FFA24D]">
                    Kode: {cert.certificateCode}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-[#F4F7FF]">
                    {cert.divisionName}
                  </h3>
                  <p className="mt-1 text-xs text-[#A9B8DB] tabular-nums">
                    Skor Ujian Akhir: <strong className="text-[#34D399]">{cert.finalExamScore}%</strong> ·{' '}
                    {new Date(cert.completedDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenCertificate(cert.divisionId)}
                  className="cta-orange inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold text-white cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  Buka & Cetak Sertifikat (PDF)
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Progres Per Divisi */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-display text-lg font-bold text-[#F4F7FF]">
          Rincian Progres per Divisi
        </h2>
        <div className="divide-y divide-[#5A96FF]/15">
          {DIVISIONS.map((div) => {
            const p = getDivisionProgress(div.id);
            return (
              <div
                key={div.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-[#2F6BFF]/22 border border-[#5AA2FF]/30 flex items-center justify-center text-[#5AA2FF] shrink-0">
                    <DivisionIcon name={div.iconName} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm sm:text-base font-bold text-[#F4F7FF] truncate">
                      {div.name}
                    </p>
                    <p className="text-xs text-[#A9B8DB] tabular-nums">
                      {p.completed}/{p.total} modul ·{' '}
                      {p.bestFinalScore !== null
                        ? `Ujian Akhir: ${p.bestFinalScore}%`
                        : 'Ujian Akhir: Belum'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 md:w-80 shrink-0">
                  <div className="flex-1 space-y-1">
                    <ProgressBar value={p.percent} heightClass="h-2" />
                  </div>
                  <span className="text-xs font-bold text-[#F4F7FF] w-10 text-right tabular-nums">
                    {p.percent}%
                  </span>
                  {p.hasCertificate ? (
                    <button
                      type="button"
                      onClick={() => onOpenCertificate(div.id)}
                      className="text-xs font-semibold text-[#34D399] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Sertifikat
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenDivision(
                          div.id,
                          p.completed === p.total ? 'quiz' : 'training'
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#5AA2FF] hover:text-[#FFA24D] cursor-pointer whitespace-nowrap"
                    >
                      {p.completed === p.total ? 'Ujian' : 'Lanjut'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Riwayat Kuis Terbaru */}
      <section className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <ClipboardCheck className="w-5 h-5 text-[#5AA2FF]" />
          <h2 className="font-display text-lg font-bold text-[#F4F7FF]">
            Riwayat Kuis & Ujian
          </h2>
        </div>

        {quizAttempts.length === 0 ? (
          <p className="text-sm text-[#A9B8DB]">
            Belum ada riwayat kuis. Buka salah satu divisi lalu pilih tab Kuis & Ujian untuk menguji pemahamanmu.
          </p>
        ) : (
          <div className="divide-y divide-[#5A96FF]/15">
            {quizAttempts.slice(0, 15).map((q) => (
              <div
                key={q.id}
                className="py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#F4F7FF]">{q.title}</p>
                  <p className="text-xs text-[#A9B8DB] tabular-nums">
                    {new Date(q.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    · {q.correctCount}/{q.totalQuestions} benar
                  </p>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span
                    className={`text-sm font-bold ${
                      q.passed ? 'text-[#34D399]' : 'text-[#FCA5A5]'
                    }`}
                  >
                    {q.score}%
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      q.passed ? 'text-[#34D399]' : 'text-[#FCA5A5]'
                    }`}
                  >
                    {q.passed ? 'Lulus' : 'Belum Lulus'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
