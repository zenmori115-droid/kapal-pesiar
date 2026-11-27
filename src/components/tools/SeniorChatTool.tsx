import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RefreshCw, Send, Trash2 } from 'lucide-react';
import { ASSETS, QUICK_SENIOR_QUESTIONS } from '../../data/divisions';
import { sendSeniorChatMessage } from '../../services/aiClient';
import { ChatMessage, UserProfile } from '../../types/academy';
import { ErrorRetryCard } from '../ui/CommonUI';

interface SeniorChatToolProps {
  profile: UserProfile | null;
  messages: ChatMessage[];
  onUpdateMessages: (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void;
}

export function SeniorChatTool({
  profile,
  messages,
  onUpdateMessages,
}: SeniorChatToolProps) {
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendText = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMsg];
    onUpdateMessages(nextHistory);
    setInput('');
    setSending(true);
    setError(null);
    setLastFailedText(null);

    try {
      const reply = await sendSeniorChatMessage({
        history: messages.map((m) => ({ role: m.role, text: m.text })),
        message: text,
        profile,
      });
      onUpdateMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'model',
          text: reply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Gagal mengirim pertanyaan. Silakan coba lagi.'
      );
      setLastFailedText(text);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendText(input);
  };

  return (
    <div className="space-y-4">
      {/* Senior Header */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={ASSETS.seniorAvatar}
            alt="Senior Cruise Training Officer"
            referrerPolicy="no-referrer"
            className="h-14 w-14 rounded-2xl object-cover border border-[#FFA24D]/50 shadow-[0_0_20px_rgba(255,122,26,0.28)] shrink-0"
          />
          <div>
            <p className="text-xs font-semibold text-[#FFA24D]">
              15+ Tahun Pengalaman Industri Kapal Pesiar
            </p>
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#F4F7FF]">
              Tanya Senior Training Officer AI
            </h2>
            <p className="text-xs sm:text-sm text-[#A9B8DB]">
              Diskusi bebas soal budaya kerja, kehidupan Crew Area, adaptasi, hingga persiapan umum.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => onUpdateMessages([])}
            className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 min-h-[42px] text-xs font-medium text-[#A9B8DB] hover:text-[#FCA5A5] bg-[#091432]/75 border border-[#5A96FF]/20 hover:border-[#F87171]/40 transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Bersihkan Chat
          </button>
        )}
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-[#A9B8DB]">Saran Pertanyaan Cepat</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_SENIOR_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              disabled={sending}
              onClick={() => sendText(q)}
              className="text-left rounded-xl px-3.5 py-2 min-h-[40px] text-xs text-[#D7E2FA] bg-[#0C1B44]/75 border border-[#5A96FF]/25 hover:border-[#FF7A1A]/60 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <ErrorRetryCard
          message={error}
          onRetry={() => {
            if (lastFailedText) sendText(lastFailedText);
          }}
        />
      )}

      {/* Chat Box */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 flex flex-col h-[500px] sm:h-[560px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto space-y-3">
              <img
                src={ASSETS.seniorAvatar}
                alt="Senior Officer"
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-2xl object-cover border border-[#5AA2FF]/40"
              />
              <h3 className="font-display text-base sm:text-lg font-bold text-[#F4F7FF]">
                Halo, {profile?.name || 'Calon Kru'}! Ada yang ingin ditanyakan?
              </h3>
              <p className="text-sm text-[#A9B8DB] leading-relaxed">
                Tanyakan apa saja seputar kehidupan sehari-hari di kapal pesiar, tips menghadapi kontrak pertama, istilah di Crew Mess, atau cara menjaga performa kerja.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-3.5 text-sm ${
                      isUser
                        ? 'bg-[#2F6BFF]/35 border border-[#5AA2FF]/50 text-[#F4F7FF]'
                        : 'bg-[#091432]/90 border border-[#5A96FF]/25 text-[#D7E2FA]'
                    }`}
                  >
                    <p className="text-[11px] font-semibold mb-1.5 text-[#FFA24D]">
                      {isUser ? profile?.name || 'Kamu' : 'Senior Training Officer AI'}
                    </p>
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    ) : (
                      <div className="academy-markdown">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 bg-[#091432]/90 border border-[#5A96FF]/25 text-xs text-[#A9B8DB] flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FFA24D]" />
                <span>Senior Officer sedang mengetik jawaban...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 pt-3 border-t border-[#5A96FF]/20 flex items-center gap-2.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder="Tulis pertanyaanmu seputar kapal pesiar..."
            className="flex-1 rounded-xl bg-[#07112B] border border-[#5A96FF]/35 px-4 py-3 min-h-[46px] text-sm text-[#F4F7FF] placeholder-[#6E82B0] focus:outline-none focus:border-[#FF7A1A]"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            aria-label="Kirim pertanyaan"
            className="cta-orange shrink-0 h-[46px] w-[46px] rounded-xl flex items-center justify-center text-white cursor-pointer disabled:opacity-45"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
