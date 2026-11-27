import React, { useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Languages,
  Lightbulb,
  Play,
  RefreshCw,
} from 'lucide-react';
import { DIVISIONS, getDivisionById } from '../../data/divisions';
import {
  evaluateInterviewSession,
  startInterviewSession,
} from '../../services/aiClient';
import {
  InterviewFeedback,
  InterviewTurn,
  UserProfile,
} from '../../types/academy';
import {
  ErrorRetryCard,
  GlowSkeleton,
  ProgressBar,
  ShareActions,
} from '../ui/CommonUI';

interface InterviewToolProps {
  profile: UserProfile | null;
}

export function InterviewTool({ profile }: InterviewToolProps) {
  const [divisionId, setDivisionId] = useState(
    profile?.targetDivisionId || 'housekeeping'
  );
  const [language, setLanguage] = useState<'id' | 'en'>('en');

  const [greeting, setGreeting] = useState('');
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerDraft, setAnswerDraft] = useState('');
  const [showTip, setShowTip] = useState(false);

  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const division = getDivisionById(divisionId);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setTurns([]);
    setCurrentIdx(0);
    setAnswerDraft('');
    setShowTip(false);

    try {
      const res = await startInterviewSession({
        divisionName: division.name,
        roles: division.roles,
        language,
        profile,
      });
      setGreeting(res.greeting);
      setTurns(
        (res.questions || []).map((q, idx) => ({
          questionNumber: idx + 1,
          question: q.question,
          tip: q.tip,
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memulai simulasi wawancara.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = answerDraft.trim();
    if (!trimmed) return;

    const updated = turns.map((t, idx) =>
      idx === currentIdx ? { ...t, userAnswer: trimmed } : t
    );
    setTurns(updated);
    setAnswerDraft('');
    setShowTip(false);

    if (currentIdx < updated.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      return;
    }

    // Last question answered -> evaluate
    setEvaluating(true);
    setError(null);
    try {
      const result = await evaluateInterviewSession({
        divisionName: division.name,
        language,
        turns: updated,
        profile,
      });
      setFeedback(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal menilai jawaban wawancara. Silakan coba lagi.'
      );
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <GlowSkeleton
        title={`Recruiter AI sedang menyiapkan sesi wawancara ${division.shortName}...`}
        subtitle="Menyusun 6 pertanyaan wawancara terstruktur dari perkenalan hingga studi kasus."
        lines={4}
      />
    );
  }

  if (evaluating) {
    return (
      <GlowSkeleton
        title="Recruiter AI sedang menilai jawaban wawancaramu..."
        subtitle="Menghitung skor komunikasi, kesiapan teknis, service mindset, dan menyusun contoh jawaban ideal."
        lines={5}
      />
    );
  }

  // Final Feedback View
  if (feedback) {
    const shareText = `Hasil Simulasi Wawancara Kapal Pesiar (${division.shortName}) — CruiseCrew Academy\nSkor Keseluruhan: ${feedback.overallScore}/100\nKomunikasi: ${feedback.communicationScore} | Teknis: ${feedback.technicalScore} | Service Mindset: ${feedback.serviceMindsetScore}\nCatatan: ${feedback.verdict}`;
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border-[#5AA2FF]/35">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#FFA24D]">
                Laporan Evaluasi Recruiter AI · {division.shortName}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#F4F7FF]">
                Hasil Simulasi Wawancara Kerja
              </h2>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-[#A9B8DB]">Skor Keseluruhan</p>
              <p
                className={`font-display text-4xl font-extrabold tabular-nums ${
                  feedback.overallScore >= 75 ? 'text-[#34D399]' : 'text-[#FFA24D]'
                }`}
              >
                {feedback.overallScore}/100
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-[15px] text-[#D7E2FA] leading-relaxed">
            {feedback.verdict}
          </p>

          {/* 3 Sub-Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              { label: 'Komunikasi', score: feedback.communicationScore },
              { label: 'Kesiapan Teknis', score: feedback.technicalScore },
              { label: 'Service Mindset', score: feedback.serviceMindsetScore },
            ].map((m) => (
              <div
                key={m.label}
                className="rounded-xl bg-[#091432]/85 border border-[#5A96FF]/20 p-4 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A9B8DB]">{m.label}</span>
                  <span className="font-bold text-[#F4F7FF] tabular-nums">{m.score}%</span>
                </div>
                <ProgressBar value={m.score} heightClass="h-2" />
              </div>
            ))}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#0B2A26]/70 border border-[#34D399]/30 p-5 space-y-2.5">
              <h3 className="font-display text-sm font-bold text-[#34D399]">
                Kekuatan Kandidat
              </h3>
              <ul className="space-y-2">
                {feedback.strengths.map((s, idx) => (
                  <li key={idx} className="text-sm text-[#E4F9F2] flex items-start gap-2 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-[#341825]/65 border border-[#F87171]/30 p-5 space-y-2.5">
              <h3 className="font-display text-sm font-bold text-[#FCA5A5]">
                Fokus Perbaikan Sebelum Wawancara Asli
              </h3>
              <ul className="space-y-2">
                {feedback.improvements.map((imp, idx) => (
                  <li key={idx} className="text-sm text-[#FCE7EA] flex items-start gap-2 leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#FCA5A5] shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ideal Sample Answers */}
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-[#F4F7FF]">
              Contoh Jawaban Ideal untuk Pertanyaan Kunci
            </h3>
            <div className="space-y-3">
              {feedback.sampleAnswers.map((sa, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-[#091432]/85 border border-[#5A96FF]/25 p-4 space-y-1.5"
                >
                  <p className="text-xs font-semibold text-[#5AA2FF]">{sa.question}</p>
                  <p className="text-sm text-[#F4F7FF] leading-relaxed italic">
                    &ldquo;{sa.idealAnswer}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#5A96FF]/20">
            <ShareActions shareText={shareText} label="Bagikan ke" />
            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setTurns([]);
              }}
              className="cta-orange inline-flex items-center gap-2 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Latihan Wawancara Baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Interview Question-by-Question
  if (turns.length > 0) {
    const currentTurn = turns[currentIdx];
    const progressPct = Math.round(((currentIdx + 1) / turns.length) * 100);
    return (
      <div className="space-y-5">
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <span className="font-semibold text-[#FFA24D]">
              Wawancara {division.shortName} · {language === 'en' ? 'English' : 'Indonesia'}
            </span>
            <span className="text-[#A9B8DB] tabular-nums">
              Pertanyaan {currentIdx + 1} dari {turns.length}
            </span>
          </div>
          <ProgressBar value={progressPct} heightClass="h-2" />
        </div>

        {error && (
          <ErrorRetryCard
            message={error}
            onRetry={async () => {
              setEvaluating(true);
              setError(null);
              try {
                const res = await evaluateInterviewSession({
                  divisionName: division.name,
                  language,
                  turns,
                  profile,
                });
                setFeedback(res);
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Gagal menilai.');
              } finally {
                setEvaluating(false);
              }
            }}
          />
        )}

        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-5">
          {currentIdx === 0 && greeting && (
            <p className="text-sm text-[#A9B8DB] italic pb-3 border-b border-[#5A96FF]/20">
              Recruiter: &ldquo;{greeting}&rdquo;
            </p>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#5AA2FF]">
              Pertanyaan Recruiter #{currentTurn.questionNumber}
            </p>
            <h3 className="font-display text-lg sm:text-2xl font-bold text-[#F4F7FF] leading-snug">
              {currentTurn.question}
            </h3>
          </div>

          {currentTurn.tip && (
            <div>
              <button
                type="button"
                onClick={() => setShowTip((v) => !v)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFA24D] hover:text-[#FFB873] cursor-pointer min-h-[36px]"
              >
                <Lightbulb className="w-4 h-4" />
                {showTip ? 'Sembunyikan Tips Senior' : 'Lihat Tips Menjawab dari Senior'}
              </button>
              {showTip && (
                <div className="mt-2 rounded-xl bg-[#0D1E4D]/75 border border-[#FFA24D]/30 p-3.5 text-xs sm:text-sm text-[#E4ECFF] leading-relaxed">
                  {currentTurn.tip}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <textarea
              rows={5}
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
              placeholder={
                language === 'en'
                  ? 'Write your interview answer clearly in English...'
                  : 'Tulis jawaban wawancaramu secara jelas, sopan, dan terstruktur...'
              }
              className="w-full rounded-xl bg-[#07112B] border border-[#5A96FF]/35 px-4 py-3 text-sm text-[#F4F7FF] placeholder-[#6E82B0] focus:outline-none focus:border-[#FF7A1A]"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setTurns([]);
                  setAnswerDraft('');
                }}
                className="text-xs sm:text-sm text-[#A9B8DB] hover:text-[#F4F7FF] cursor-pointer"
              >
                Batalkan Wawancara
              </button>

              <button
                type="submit"
                disabled={!answerDraft.trim()}
                className="cta-orange inline-flex items-center gap-2 rounded-xl px-6 py-3 min-h-[46px] text-sm font-semibold text-white cursor-pointer disabled:opacity-40"
              >
                {currentIdx < turns.length - 1
                  ? 'Kirim & Pertanyaan Berikutnya'
                  : 'Selesai & Lihat Penilaian'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Setup Screen
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex items-start gap-3.5">
        <div className="h-11 w-11 rounded-xl bg-[#2F6BFF]/25 border border-[#5AA2FF]/35 flex items-center justify-center text-[#FFA24D] shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-[#F4F7FF]">
            Simulasi Wawancara Kerja Kapal Pesiar
          </h2>
          <p className="mt-1 text-sm text-[#A9B8DB] leading-relaxed">
            AI berperan sebagai recruiter kapal pesiar dan mengajukan 6 pertanyaan satu per satu sesuai divisi pilihanmu. Di akhir sesi kamu menerima skor terukur dan contoh jawaban terbaik.
          </p>
        </div>
      </div>

      {error && <ErrorRetryCard message={error} onRetry={handleStart} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label
            htmlFor="int-div"
            className="block text-xs font-semibold text-[#A9B8DB]"
          >
            Pilih Divisi yang Dilamar
          </label>
          <select
            id="int-div"
            value={divisionId}
            onChange={(e) => setDivisionId(e.target.value)}
            className="w-full rounded-xl bg-[#091432] border border-[#5A96FF]/35 px-4 py-3 min-h-[46px] text-sm text-[#F4F7FF] focus:outline-none focus:border-[#FF7A1A]"
          >
            {DIVISIONS.filter((d) => d.id !== 'mandatory').map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-[#8FA3CE]">
            Posisi terkait: {division.roles.join(', ')}
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#A9B8DB] flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-[#FFA24D]" />
            Bahasa Wawancara
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`rounded-xl px-4 py-3 min-h-[46px] text-sm font-medium border transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-[#2F6BFF]/30 border-[#FF7A1A] text-[#F4F7FF]'
                  : 'bg-[#091432]/70 border-[#5A96FF]/20 text-[#A9B8DB]'
              }`}
            >
              English (Rekomendasi)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`rounded-xl px-4 py-3 min-h-[46px] text-sm font-medium border transition-colors cursor-pointer ${
                language === 'id'
                  ? 'bg-[#2F6BFF]/30 border-[#FF7A1A] text-[#F4F7FF]'
                  : 'bg-[#091432]/70 border-[#5A96FF]/20 text-[#A9B8DB]'
              }`}
            >
              Bahasa Indonesia
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleStart}
        className="cta-orange inline-flex items-center gap-2 rounded-xl px-6 py-3 min-h-[48px] text-sm font-semibold text-white cursor-pointer"
      >
        <Play className="w-4 h-4 fill-current" />
        Mulai Wawancara (6 Pertanyaan)
      </button>
    </div>
  );
}
