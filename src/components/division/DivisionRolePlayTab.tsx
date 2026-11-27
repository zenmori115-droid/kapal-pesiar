import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Flag,
  Languages,
  MessageSquare,
  Play,
  RefreshCw,
  Send,
  ThumbsDown,
  ThumbsUp,
  User,
} from 'lucide-react';
import { evaluateRolePlay, sendRolePlayTurn } from '../../services/aiClient';
import {
  Division,
  RolePlayEvaluation,
  RolePlayMessage,
  UserProfile,
} from '../../types/academy';
import { ErrorRetryCard, GlowSkeleton, ShareActions } from '../ui/CommonUI';

interface DivisionRolePlayTabProps {
  division: Division;
  profile: UserProfile | null;
}

export function DivisionRolePlayTab({ division, profile }: DivisionRolePlayTabProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    division.rolePlayScenarios[0]?.id || 'custom'
  );
  const [customScenario, setCustomScenario] = useState('');
  const [counterpartRole, setCounterpartRole] = useState<
    'guest' | 'supervisor' | 'interviewer'
  >(division.rolePlayScenarios[0]?.defaultRole || 'guest');
  const [difficulty, setDifficulty] = useState<'ramah' | 'sedang' | 'sulit'>('sedang');
  const [language, setLanguage] = useState<'id' | 'en'>('id');

  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState<RolePlayMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<RolePlayEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedScenarioId(division.rolePlayScenarios[0]?.id || 'custom');
    setCounterpartRole(division.rolePlayScenarios[0]?.defaultRole || 'guest');
    setSessionActive(false);
    setMessages([]);
    setEvaluation(null);
    setError(null);
  }, [division]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const activeScenario = division.rolePlayScenarios.find(
    (s) => s.id === selectedScenarioId
  );
  const scenarioTitle =
    selectedScenarioId === 'custom'
      ? customScenario.trim() || 'Situasi Pelayanan Kapal Pesiar'
      : activeScenario?.title || 'Simulasi Kapal Pesiar';
  const scenarioDescription =
    selectedScenarioId === 'custom'
      ? customScenario.trim() || 'Interaksi profesional di atas kapal pesiar.'
      : activeScenario?.description || '';

  const startSession = async () => {
    if (selectedScenarioId === 'custom' && !customScenario.trim()) {
      setError('Tuliskan deskripsi skenario kustom terlebih dahulu.');
      return;
    }
    setError(null);
    setEvaluation(null);
    setMessages([]);
    setSessionActive(true);
    setSending(true);
    try {
      const opening = await sendRolePlayTurn({
        divisionName: division.name,
        scenarioTitle,
        scenarioDescription,
        counterpartRole,
        difficulty,
        language,
        history: [],
        profile,
      });
      setMessages([
        {
          role: 'model',
          text: opening,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal memulai sesi Role-Play.'
      );
      setSessionActive(false);
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || sending || evaluating) return;

    const nextHistory: RolePlayMessage[] = [
      ...messages,
      { role: 'user', text: trimmed, timestamp: new Date().toISOString() },
    ];
    setMessages(nextHistory);
    setInputText('');
    setSending(true);
    setError(null);

    try {
      const reply = await sendRolePlayTurn({
        divisionName: division.name,
        scenarioTitle,
        scenarioDescription,
        counterpartRole,
        difficulty,
        language,
        history: nextHistory,
        profile,
      });
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: reply, timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal mengirim balasan. Coba lagi.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleFinishAndEvaluate = async () => {
    const userTurns = messages.filter((m) => m.role === 'user').length;
    if (userTurns === 0) {
      setError('Balas percakapan minimal 1 kali sebelum meminta penilaian.');
      return;
    }
    setEvaluating(true);
    setError(null);
    try {
      const result = await evaluateRolePlay({
        divisionName: division.name,
        scenarioTitle,
        counterpartRole,
        difficulty,
        language,
        history: messages,
        profile,
      });
      setEvaluation(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal menilai sesi Role-Play.'
      );
    } finally {
      setEvaluating(false);
    }
  };

  const roleLabels = {
    guest: 'Tamu Kapal Pesiar',
    supervisor: 'Supervisor / Manager',
    interviewer: 'Interviewer / Recruiter',
  };

  // Evaluation Screen
  if (evaluation) {
    const passed = evaluation.score >= 70;
    const shareText = `Hasil Simulasi Role-Play AI (${division.shortName}) — CruiseCrew Academy\nSkenario: ${scenarioTitle}\nSkor: ${evaluation.score}/100\nRingkasan: ${evaluation.summary}`;
    return (
      <div className="space-y-6">
        <div
          className={`glass-card rounded-2xl p-6 sm:p-8 space-y-5 border ${
            passed ? 'border-[#34D399]/45' : 'border-[#FFA24D]/45'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#FFA24D]">
                Penilaian Senior Training Officer AI
              </p>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#F4F7FF]">
                {scenarioTitle}
              </h2>
              <p className="mt-1 text-xs text-[#A9B8DB]">
                Lawan bicara: {roleLabels[counterpartRole]} · Tingkat: {difficulty} · Bahasa:{' '}
                {language === 'en' ? 'English' : 'Indonesia'}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs text-[#A9B8DB]">Skor Role-Play</p>
              <p
                className={`font-display text-4xl font-extrabold tabular-nums ${
                  passed ? 'text-[#34D399]' : 'text-[#FFA24D]'
                }`}
              >
                {evaluation.score}/100
              </p>
            </div>
          </div>

          <p className="text-sm sm:text-[15px] text-[#D7E2FA] leading-relaxed">
            {evaluation.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-[#0B2A26]/70 border border-[#34D399]/30 p-5 space-y-2.5">
              <h3 className="font-display text-sm font-bold text-[#34D399] flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                Kelebihanmu
              </h3>
              <ul className="space-y-2">
                {evaluation.strengths.map((s, idx) => (
                  <li key={idx} className="text-sm text-[#E4F9F2] leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-[#341825]/65 border border-[#F87171]/30 p-5 space-y-2.5">
              <h3 className="font-display text-sm font-bold text-[#FCA5A5] flex items-center gap-2">
                <ThumbsDown className="w-4 h-4" />
                Area yang Perlu Ditingkatkan
              </h3>
              <ul className="space-y-2">
                {evaluation.weaknesses.map((w, idx) => (
                  <li key={idx} className="text-sm text-[#FCE7EA] leading-relaxed flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#FCA5A5] shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-[#F4F7FF]">
              Contoh Jawaban yang Lebih Profesional
            </h3>
            <div className="space-y-3">
              {evaluation.betterResponses.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-[#091432]/85 border border-[#5A96FF]/25 p-4 space-y-1.5"
                >
                  <p className="text-xs font-semibold text-[#5AA2FF]">{item.situation}</p>
                  <p className="text-sm text-[#F4F7FF] leading-relaxed italic">
                    &ldquo;{item.suggestedReply}&rdquo;
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
                setEvaluation(null);
                setSessionActive(false);
                setMessages([]);
              }}
              className="cta-orange inline-flex items-center gap-2 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Latih Skenario Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Evaluating Skeleton
  if (evaluating) {
    return (
      <GlowSkeleton
        title="Senior Officer AI sedang mengevaluasi percakapanmu..."
        subtitle="Menganalisis empati, ketepatan SOP, dan menyusun contoh kalimat yang lebih baik."
        lines={5}
      />
    );
  }

  // Active Chat Role-Play View
  if (sessionActive) {
    const userCount = messages.filter((m) => m.role === 'user').length;
    return (
      <div className="space-y-4">
        <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#FFA24D]">
              Role-Play Aktif · {roleLabels[counterpartRole]} · Tingkat {difficulty} ·{' '}
              {language === 'en' ? 'English Mode' : 'Mode Indonesia'}
            </p>
            <h2 className="font-display text-base sm:text-lg font-bold text-[#F4F7FF]">
              {scenarioTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSessionActive(false);
                setMessages([]);
                setError(null);
              }}
              className="rounded-xl px-3.5 py-2 min-h-[44px] text-xs font-medium text-[#A9B8DB] hover:text-[#F4F7FF] bg-[#0B1738]/75 border border-[#5A96FF]/25 cursor-pointer whitespace-nowrap"
            >
              Ganti Skenario
            </button>
            <button
              type="button"
              onClick={handleFinishAndEvaluate}
              disabled={userCount === 0 || sending}
              className="cta-orange inline-flex items-center gap-2 rounded-xl px-4 py-2 min-h-[44px] text-xs sm:text-sm font-semibold text-white cursor-pointer disabled:opacity-45 whitespace-nowrap"
            >
              <Flag className="w-4 h-4" />
              Akhiri & Nilai
            </button>
          </div>
        </div>

        {error && <ErrorRetryCard message={error} onRetry={handleFinishAndEvaluate} />}

        <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-col h-[460px] sm:h-[520px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#2F6BFF]/35 border border-[#5AA2FF]/50 text-[#F4F7FF]'
                        : 'bg-[#091432]/90 border border-[#5A96FF]/25 text-[#E3ECFF]'
                    }`}
                  >
                    <p className="text-[11px] font-semibold mb-1 text-[#A9B8DB]">
                      {isUser ? `${profile?.name || 'Kamu'} (Kru)` : roleLabels[counterpartRole]}
                    </p>
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-[#091432]/85 border border-[#5A96FF]/25 text-xs text-[#A9B8DB] flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#5AA2FF]" />
                  <span>{roleLabels[counterpartRole]} sedang merespons...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSendReply}
            className="mt-4 pt-3 border-t border-[#5A96FF]/20 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sending}
              placeholder={
                language === 'en'
                  ? 'Type your response in English...'
                  : 'Tulis respons profesionalmu di sini...'
              }
              className="flex-1 rounded-xl bg-[#07112B] border border-[#5A96FF]/35 px-4 py-3 min-h-[46px] text-sm text-[#F4F7FF] placeholder-[#6E82B0] focus:outline-none focus:border-[#FF7A1A]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              aria-label="Kirim respons"
              className="cta-orange shrink-0 h-[46px] w-[46px] rounded-xl flex items-center justify-center text-white cursor-pointer disabled:opacity-45"
            >
              <Send className="w-4 h-4" />
            </button>
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
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-[#F4F7FF]">
            Simulasi Role-Play AI — {division.shortName}
          </h2>
          <p className="mt-1 text-sm text-[#A9B8DB] leading-relaxed">
            Latih percakapan nyata dengan tamu kapal pesiar, supervisor, atau interviewer. Setelah selesai, Senior Officer AI akan menilai performamu lengkap dengan contoh jawaban ideal.
          </p>
        </div>
      </div>

      {error && <ErrorRetryCard message={error} onRetry={startSession} />}

      {/* Scenario Selector */}
      <div className="space-y-3">
        <span className="block text-sm font-semibold text-[#F4F7FF]">
          1. Pilih Skenario Latihan
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {division.rolePlayScenarios.map((sc) => {
            const active = selectedScenarioId === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  setSelectedScenarioId(sc.id);
                  setCounterpartRole(sc.defaultRole);
                }}
                className={`text-left rounded-xl p-4 border transition-all cursor-pointer ${
                  active
                    ? 'bg-[#2F6BFF]/25 border-[#FF7A1A] shadow-[0_0_16px_rgba(255,122,26,0.22)]'
                    : 'bg-[#091432]/75 border-[#5A96FF]/20 hover:border-[#5AA2FF]/45'
                }`}
              >
                <p className="font-display text-sm font-bold text-[#F4F7FF]">{sc.title}</p>
                <p className="mt-1 text-xs text-[#A9B8DB] leading-relaxed">
                  {sc.description}
                </p>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSelectedScenarioId('custom')}
            className={`text-left rounded-xl p-4 border transition-all cursor-pointer ${
              selectedScenarioId === 'custom'
                ? 'bg-[#2F6BFF]/25 border-[#FF7A1A] shadow-[0_0_16px_rgba(255,122,26,0.22)]'
                : 'bg-[#091432]/75 border-[#5A96FF]/20 hover:border-[#5AA2FF]/45'
            }`}
          >
            <p className="font-display text-sm font-bold text-[#F4F7FF]">
              Skenario Kustom Sendiri
            </p>
            <p className="mt-1 text-xs text-[#A9B8DB] leading-relaxed">
              Tentukan situasi khusus yang ingin kamu latih di divisi {division.shortName}.
            </p>
          </button>
        </div>

        {selectedScenarioId === 'custom' && (
          <textarea
            rows={2}
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            placeholder="Contoh: Tamu VIP mengeluh meja makan dekat jendela belum tersedia saat Formal Night..."
            className="w-full rounded-xl bg-[#07112B] border border-[#5A96FF]/35 px-4 py-3 text-sm text-[#F4F7FF] placeholder-[#6E82B0] focus:outline-none focus:border-[#FF7A1A]"
          />
        )}
      </div>

      {/* Role, Difficulty & Language */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#A9B8DB] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#5AA2FF]" />
            Peran Lawan Bicara AI
          </span>
          <div className="flex flex-col gap-2">
            {(['guest', 'supervisor', 'interviewer'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setCounterpartRole(r)}
                className={`rounded-xl px-3.5 py-2.5 min-h-[44px] text-left text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
                  counterpartRole === r
                    ? 'bg-[#2F6BFF]/30 border-[#FF7A1A] text-[#F4F7FF]'
                    : 'bg-[#091432]/70 border-[#5A96FF]/20 text-[#A9B8DB] hover:border-[#5AA2FF]/45'
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="block text-xs font-semibold text-[#A9B8DB]">
            Tingkat Kesulitan
          </span>
          <div className="flex flex-col gap-2">
            {(
              [
                { id: 'ramah', label: 'Ramah (Pemula)' },
                { id: 'sedang', label: 'Sedang (Realistis)' },
                { id: 'sulit', label: 'Sulit (Kritis / Komplain)' },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficulty(d.id)}
                className={`rounded-xl px-3.5 py-2.5 min-h-[44px] text-left text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
                  difficulty === d.id
                    ? 'bg-[#2F6BFF]/30 border-[#FF7A1A] text-[#F4F7FF]'
                    : 'bg-[#091432]/70 border-[#5A96FF]/20 text-[#A9B8DB] hover:border-[#5AA2FF]/45'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#A9B8DB] flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-[#FFA24D]" />
            Bahasa Percakapan
          </span>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`rounded-xl px-3.5 py-2.5 min-h-[44px] text-left text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
                language === 'id'
                  ? 'bg-[#2F6BFF]/30 border-[#FF7A1A] text-[#F4F7FF]'
                  : 'bg-[#091432]/70 border-[#5A96FF]/20 text-[#A9B8DB] hover:border-[#5AA2FF]/45'
              }`}
            >
              Bahasa Indonesia
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`rounded-xl px-3.5 py-2.5 min-h-[44px] text-left text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-[#2F6BFF]/30 border-[#FF7A1A] text-[#F4F7FF]'
                  : 'bg-[#091432]/70 border-[#5A96FF]/20 text-[#A9B8DB] hover:border-[#5AA2FF]/45'
              }`}
            >
              English Practice Mode
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={startSession}
          className="cta-orange inline-flex items-center gap-2 rounded-xl px-6 py-3 min-h-[48px] text-sm font-semibold text-white cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          Mulai Simulasi Role-Play
        </button>
      </div>
    </div>
  );
}
