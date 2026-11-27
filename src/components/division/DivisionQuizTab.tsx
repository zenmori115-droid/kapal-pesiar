import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { fetchQuizQuestions } from '../../services/aiClient';
import {
  Division,
  QuizAttempt,
  QuizQuestion,
  UserProfile,
} from '../../types/academy';
import {
  ErrorRetryCard,
  GlowSkeleton,
  ProgressBar,
  ShareActions,
} from '../ui/CommonUI';

interface DivisionQuizTabProps {
  division: Division;
  profile: UserProfile | null;
  initialModuleId?: string | null;
  recentAttempts: QuizAttempt[];
  allModulesCompleted: boolean;
  hasCertificate: boolean;
  onSaveAttempt: (attempt: QuizAttempt) => void;
  onOpenCertificate: () => void;
}

export function DivisionQuizTab({
  division,
  profile,
  initialModuleId,
  recentAttempts,
  allModulesCompleted,
  hasCertificate,
  onSaveAttempt,
  onOpenCertificate,
}: DivisionQuizTabProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>(
    initialModuleId || division.modules[0]?.id || 'final-exam'
  );
  const [questionCount, setQuestionCount] = useState<number>(6);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [activeTitle, setActiveTitle] = useState('');
  const [activeIsFinal, setActiveIsFinal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialModuleId) {
      setSelectedTarget(initialModuleId);
    }
  }, [initialModuleId]);

  const startQuiz = useCallback(
    async (targetId: string, customCount?: number) => {
      const isFinal = targetId === 'final-exam';
      const mod = division.modules.find((m) => m.id === targetId);
      const title = isFinal
        ? `Ujian Akhir Divisi — ${division.shortName}`
        : `Kuis: ${mod?.title || division.shortName}`;

      setLoading(true);
      setError(null);
      setQuestions([]);
      setAnswers({});
      setCurrentIdx(0);
      setFinished(false);
      setActiveTitle(title);
      setActiveIsFinal(isFinal);

      try {
        const list = await fetchQuizQuestions({
          divisionName: division.name,
          moduleTitle: mod?.title,
          moduleTitles: division.modules.map((m) => m.title),
          questionCount: isFinal ? 20 : customCount || questionCount,
          isFinalExam: isFinal,
          profile,
        });
        if (!list.length) {
          throw new Error('AI belum mengembalikan soal. Silakan coba lagi.');
        }
        setQuestions(list);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Gagal membuat soal kuis. Silakan coba lagi.'
        );
      } finally {
        setLoading(false);
      }
    },
    [division, profile, questionCount]
  );

  const handleSelectOption = (optIndex: number) => {
    if (answers[currentIdx] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [currentIdx]: optIndex }));
  };

  const handleNextOrFinish = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      return;
    }

    const correctCount = questions.reduce(
      (acc, q, idx) => acc + (answers[idx] === q.correctIndex ? 1 : 0),
      0
    );
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70;

    onSaveAttempt({
      id: `quiz-${Date.now()}`,
      divisionId: division.id,
      moduleId: activeIsFinal ? 'final-exam' : selectedTarget,
      title: activeTitle,
      score,
      totalQuestions: questions.length,
      correctCount,
      passed,
      date: new Date().toISOString(),
    });
    setFinished(true);
  };

  // Loading state
  if (loading) {
    return (
      <GlowSkeleton
        title={
          activeIsFinal
            ? `Menyusun 20 Soal Ujian Akhir ${division.shortName}...`
            : 'Menyusun Soal Kuis Pilihan Ganda...'
        }
        subtitle="Soal studi kasus nyata di kapal sedang dibuat khusus sesuai level pengalamanmu."
        lines={5}
      />
    );
  }

  // Error state
  if (error && questions.length === 0) {
    return (
      <div className="space-y-4">
        <ErrorRetryCard message={error} onRetry={() => startQuiz(selectedTarget)} />
        <button
          type="button"
          onClick={() => setError(null)}
          className="text-sm text-[#5AA2FF] hover:text-[#FFA24D] cursor-pointer"
        >
          Kembali ke pilihan kuis
        </button>
      </div>
    );
  }

  // Active Quiz Runner
  if (questions.length > 0 && !finished) {
    const q = questions[currentIdx];
    const selectedOpt = answers[currentIdx];
    const isAnswered = selectedOpt !== undefined;
    const isCorrect = isAnswered && selectedOpt === q.correctIndex;
    const progressPct = Math.round(((currentIdx + 1) / questions.length) * 100);

    return (
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-[#FFA24D]">{activeTitle}</span>
            <span className="text-[#A9B8DB] tabular-nums">
              Soal {currentIdx + 1} dari {questions.length}
            </span>
          </div>
          <ProgressBar value={progressPct} heightClass="h-2" />
        </div>

        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="glass-card rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <h3 className="font-display text-lg sm:text-xl font-bold text-[#F4F7FF] leading-snug">
            {currentIdx + 1}. {q.question}
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx];
              const chosen = selectedOpt === idx;
              const correctOpt = idx === q.correctIndex;

              let cardClasses =
                'bg-[#091432]/75 border-[#5A96FF]/25 hover:border-[#5AA2FF]/65 text-[#F4F7FF]';
              if (isAnswered) {
                if (correctOpt) {
                  cardClasses =
                    'bg-[#0D3329]/80 border-[#34D399] text-[#ECFDF5] shadow-[0_0_22px_rgba(52,211,153,0.32)]';
                } else if (chosen && !correctOpt) {
                  cardClasses =
                    'bg-[#3D1420]/80 border-[#F87171] text-[#FEF2F2] shadow-[0_0_20px_rgba(248,113,113,0.3)]';
                } else {
                  cardClasses =
                    'bg-[#08122B]/50 border-[#5A96FF]/15 text-[#7F93BE] opacity-75';
                }
              }

              return (
                <motion.button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  whileTap={!isAnswered ? { scale: 0.99 } : undefined}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full rounded-2xl border p-4 sm:p-5 min-h-[56px] text-left transition-all flex items-center justify-between gap-4 ${
                    isAnswered ? 'cursor-default' : 'cursor-pointer'
                  } ${cardClasses}`}
                >
                  <div className="flex items-start gap-3.5">
                    <span className="h-7 w-7 rounded-lg bg-[#142864]/80 border border-[#5A96FF]/30 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {letter}
                    </span>
                    <span className="text-sm sm:text-[15px] leading-relaxed">{opt}</span>
                  </div>

                  {isAnswered && correctOpt && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#34D399] shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                      Benar
                    </span>
                  )}
                  {isAnswered && chosen && !correctOpt && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FCA5A5] shrink-0">
                      <XCircle className="w-5 h-5" />
                      Salah
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-5 border space-y-1.5 ${
                isCorrect
                  ? 'bg-[#0C2F27]/70 border-[#34D399]/40'
                  : 'bg-[#361522]/70 border-[#F87171]/40'
              }`}
            >
              <p
                className={`text-sm font-bold flex items-center gap-2 ${
                  isCorrect ? 'text-[#34D399]' : 'text-[#FCA5A5]'
                }`}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Jawaban Tepat!
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Kurang Tepat — Jawaban benar adalah opsi {['A', 'B', 'C', 'D'][q.correctIndex]}
                  </>
                )}
              </p>
              <p className="text-sm text-[#E4ECFF] leading-relaxed">{q.explanation}</p>
            </motion.div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setQuestions([]);
                setFinished(false);
              }}
              className="text-xs sm:text-sm text-[#A9B8DB] hover:text-[#F4F7FF] cursor-pointer"
            >
              Batalkan Kuis
            </button>

            <button
              type="button"
              disabled={!isAnswered}
              onClick={handleNextOrFinish}
              className="cta-orange rounded-xl px-6 py-3 min-h-[46px] text-sm font-semibold text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {currentIdx < questions.length - 1
                ? 'Soal Berikutnya'
                : 'Lihat Hasil & Pembahasan'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Results Screen
  if (finished && questions.length > 0) {
    const correctCount = questions.reduce(
      (acc, q, idx) => acc + (answers[idx] === q.correctIndex ? 1 : 0),
      0
    );
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 70;
    const unlockedCertificateNow =
      (activeIsFinal && passed && allModulesCompleted) || hasCertificate;

    const shareText = `Hasil ${activeTitle} di CruiseCrew Academy!\nSkor: ${score}% (${correctCount}/${questions.length} benar)\nStatus: ${
      passed ? 'LULUS (minimal 70%)' : 'Perlu Latihan Lagi'
    }\nSiap berlayar bersama CruiseCrew Academy!`;

    return (
      <div className="space-y-6">
        <div
          className={`glass-card rounded-2xl p-6 sm:p-8 space-y-5 border ${
            passed ? 'border-[#34D399]/50' : 'border-[#F87171]/45'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p
                className={`text-sm font-semibold flex items-center gap-2 ${
                  passed ? 'text-[#34D399]' : 'text-[#FCA5A5]'
                }`}
              >
                {passed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Status: LULUS (Ambang batas 70%)
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    Status: BELUM LULUS (Minimal 70%)
                  </>
                )}
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#F4F7FF]">
                {activeTitle}
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-[#A9B8DB]">Skor Akhir</p>
              <p
                className={`font-display text-4xl sm:text-5xl font-extrabold tabular-nums ${
                  passed ? 'text-[#34D399]' : 'text-[#FFA24D]'
                }`}
              >
                {score}%
              </p>
              <p className="text-xs text-[#A9B8DB] tabular-nums">
                {correctCount} dari {questions.length} benar
              </p>
            </div>
          </div>

          {unlockedCertificateNow && (
            <div className="rounded-xl bg-[#0D3028]/80 border border-[#34D399]/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-[#FFA24D] shrink-0" />
                <p className="text-sm text-[#ECFDF5]">
                  Selamat! Seluruh modul dan Ujian Akhir divisi{' '}
                  <strong>{division.shortName}</strong> telah lulus. Sertifikat digitalmu siap dicetak.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenCertificate}
                className="cta-orange shrink-0 rounded-xl px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold text-white cursor-pointer whitespace-nowrap"
              >
                Lihat Sertifikat
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#5A96FF]/20">
            <ShareActions shareText={shareText} label="Bagikan Skor ke" />

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setQuestions([]);
                  setFinished(false);
                }}
                className="rounded-xl px-4 py-2.5 min-h-[44px] text-sm font-medium text-[#A9B8DB] hover:text-[#F4F7FF] bg-[#0B1738]/75 border border-[#5A96FF]/25 cursor-pointer"
              >
                Pilih Kuis Lain
              </button>
              <button
                type="button"
                onClick={() => startQuiz(activeIsFinal ? 'final-exam' : selectedTarget)}
                className="cta-orange inline-flex items-center gap-2 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Ulangi dengan Soal Baru
              </button>
            </div>
          </div>
        </div>

        {/* Review Pembahasan Semua Soal */}
        <section className="space-y-3.5">
          <h3 className="font-display text-lg font-bold text-[#F4F7FF]">
            Pembahasan Lengkap ({questions.length} Soal)
          </h3>
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const userAns = answers[idx];
              const ok = userAns === q.correctIndex;
              return (
                <div
                  key={q.id}
                  className={`glass-card rounded-2xl p-5 space-y-2 border ${
                    ok ? 'border-[#34D399]/30' : 'border-[#F87171]/35'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm sm:text-base font-semibold text-[#F4F7FF]">
                      {idx + 1}. {q.question}
                    </p>
                    <span
                      className={`text-xs font-semibold shrink-0 ${
                        ok ? 'text-[#34D399]' : 'text-[#FCA5A5]'
                      }`}
                    >
                      {ok ? 'Benar' : 'Salah'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#A9B8DB]">
                    Jawabanmu:{' '}
                    <span className={ok ? 'text-[#34D399] font-medium' : 'text-[#FCA5A5] font-medium'}>
                      {userAns !== undefined ? q.options[userAns] : '-'}
                    </span>
                  </p>
                  {!ok && (
                    <p className="text-xs sm:text-sm text-[#34D399]">
                      Jawaban Benar: <span className="font-semibold">{q.options[q.correctIndex]}</span>
                    </p>
                  )}
                  <p className="text-xs sm:text-sm text-[#D7E2FA] leading-relaxed pt-1">
                    {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  // Quiz & Final Exam Selection Screen
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Kuis Per Modul */}
        <section className="lg:col-span-7 glass-card rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#2F6BFF]/25 border border-[#5AA2FF]/35 flex items-center justify-center text-[#5AA2FF]">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#F4F7FF]">
                Kuis Latihan Per Modul
              </h2>
              <p className="text-xs sm:text-sm text-[#A9B8DB]">
                Pilih modul & jumlah soal (5–10 soal pilihan ganda, lulus minimal 70%).
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label
              htmlFor="quiz-module-select"
              className="block text-xs font-semibold text-[#A9B8DB]"
            >
              Pilih Modul
            </label>
            <select
              id="quiz-module-select"
              value={selectedTarget === 'final-exam' ? division.modules[0]?.id : selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full rounded-xl bg-[#091432] border border-[#5A96FF]/35 px-4 py-3 min-h-[46px] text-sm text-[#F4F7FF] focus:outline-none focus:border-[#FF7A1A]"
            >
              {division.modules.map((m) => (
                <option key={m.id} value={m.id}>
                  Modul {m.order} ({m.levelLabel}): {m.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-[#A9B8DB]">
              Jumlah Soal
            </span>
            <div className="flex items-center gap-2">
              {[5, 6, 8, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`px-4 py-2 min-h-[44px] rounded-xl text-sm font-semibold border transition-all cursor-pointer tabular-nums ${
                    questionCount === num
                      ? 'bg-[#2F6BFF]/30 border-[#FF7A1A] text-[#F4F7FF]'
                      : 'bg-[#091432]/70 border-[#5A96FF]/20 text-[#A9B8DB] hover:border-[#5AA2FF]/50'
                  }`}
                >
                  {num} Soal
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              startQuiz(
                selectedTarget === 'final-exam'
                  ? division.modules[0].id
                  : selectedTarget,
                questionCount
              )
            }
            className="cta-orange w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 min-h-[46px] text-sm font-semibold text-white cursor-pointer"
          >
            Mulai Kuis Modul
          </button>
        </section>

        {/* Ujian Akhir Divisi (20 Soal) */}
        <section className="lg:col-span-5 glass-card rounded-2xl p-6 flex flex-col justify-between border-[#FF7A1A]/40 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#FF7A1A]/20 border border-[#FF7A1A]/45 flex items-center justify-center text-[#FFA24D]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#FFA24D]">Evaluasi Komprehensif</p>
                <h2 className="font-display text-lg font-bold text-[#F4F7FF]">
                  Ujian Akhir Divisi
                </h2>
              </div>
            </div>
            <p className="text-sm text-[#D7E2FA] leading-relaxed">
              20 soal pilihan ganda campuran dari seluruh modul {division.shortName}. Raih skor minimal <strong>70%</strong> dan selesaikan semua modul untuk membuka Sertifikat Penyelesaian digital.
            </p>
            <p className="text-xs text-[#A9B8DB]">
              Status modul:{' '}
              <span className={allModulesCompleted ? 'text-[#34D399] font-semibold' : 'text-[#FFA24D]'}>
                {allModulesCompleted
                  ? 'Semua modul selesai'
                  : 'Beberapa modul belum ditandai selesai (ujian tetap bisa dicoba)'}
              </span>
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedTarget('final-exam');
                startQuiz('final-exam', 20);
              }}
              className="cta-orange w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 min-h-[46px] text-sm font-semibold text-white cursor-pointer"
            >
              Mulai Ujian Akhir (20 Soal)
            </button>

            {hasCertificate && (
              <button
                type="button"
                onClick={onOpenCertificate}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-semibold text-[#34D399] bg-[#0F332B]/70 border border-[#34D399]/40 hover:bg-[#14463B]/80 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                Buka Sertifikat Divisi Ini
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Riwayat Kuis Divisi */}
      {recentAttempts.length > 0 && (
        <section className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-base sm:text-lg font-bold text-[#F4F7FF]">
            Riwayat Skor Divisi Ini
          </h3>
          <div className="divide-y divide-[#5A96FF]/15">
            {recentAttempts.slice(0, 6).map((att) => (
              <div
                key={att.id}
                className="py-3 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#F4F7FF]">{att.title}</p>
                  <p className="text-xs text-[#A9B8DB] tabular-nums">
                    {new Date(att.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    · {att.correctCount}/{att.totalQuestions} benar
                  </p>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span
                    className={`text-sm font-bold ${
                      att.passed ? 'text-[#34D399]' : 'text-[#FCA5A5]'
                    }`}
                  >
                    {att.score}%
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      att.passed ? 'text-[#34D399]' : 'text-[#FCA5A5]'
                    }`}
                  >
                    {att.passed ? 'Lulus' : 'Belum Lulus'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
