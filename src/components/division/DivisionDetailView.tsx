import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  ClipboardCheck,
  FileText,
  MessageSquare,
} from 'lucide-react';
import {
  Division,
  DivisionGuideData,
  DivisionTab,
  ModuleContentData,
  QuizAttempt,
  UserProfile,
} from '../../types/academy';
import { DivisionIcon, ProgressBar } from '../ui/CommonUI';
import { DivisionGuideTab } from './DivisionGuideTab';
import { DivisionQuizTab } from './DivisionQuizTab';
import { DivisionRolePlayTab } from './DivisionRolePlayTab';
import { DivisionTrainingTab } from './DivisionTrainingTab';

interface DivisionDetailViewProps {
  division: Division;
  activeTab: DivisionTab;
  initialModuleId?: string;
  profile: UserProfile | null;
  progress: {
    total: number;
    completed: number;
    percent: number;
    bestFinalScore: number | null;
    passedFinal: boolean;
    hasCertificate: boolean;
  };
  completedModules: Record<string, string>;
  cachedGuide?: DivisionGuideData;
  cachedModules: Record<string, ModuleContentData>;
  quizAttempts: QuizAttempt[];
  onChangeTab: (tab: DivisionTab) => void;
  onBack: () => void;
  onCacheGuide: (guide: DivisionGuideData) => void;
  onCacheModule: (content: ModuleContentData) => void;
  onToggleComplete: (divisionId: string, moduleId: string) => void;
  onMarkComplete: (divisionId: string, moduleId: string) => void;
  onSaveAttempt: (attempt: QuizAttempt) => void;
  onRecordActivity: (divisionId: string, moduleId?: string, tab?: DivisionTab) => void;
  onOpenCertificate: (divisionId: string) => void;
}

const TABS: { id: DivisionTab; label: string; icon: React.ElementType }[] = [
  { id: 'guide', label: 'Pedoman Kerja', icon: FileText },
  { id: 'training', label: 'Pelatihan', icon: BookOpen },
  { id: 'quiz', label: 'Kuis & Ujian', icon: ClipboardCheck },
  { id: 'roleplay', label: 'Role-Play AI', icon: MessageSquare },
];

export function DivisionDetailView({
  division,
  activeTab,
  initialModuleId,
  profile,
  progress,
  completedModules,
  cachedGuide,
  cachedModules,
  quizAttempts,
  onChangeTab,
  onBack,
  onCacheGuide,
  onCacheModule,
  onToggleComplete,
  onMarkComplete,
  onSaveAttempt,
  onRecordActivity,
  onOpenCertificate,
}: DivisionDetailViewProps) {
  const [quizModuleId, setQuizModuleId] = useState<string | null>(null);

  const divisionAttempts = quizAttempts.filter((a) => a.divisionId === division.id);

  return (
    <div className="space-y-6">
      {/* Division Top Header */}
      <div className="glass-card rounded-2xl p-5 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#A9B8DB] hover:text-[#F4F7FF] transition-colors cursor-pointer min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Divisi
          </button>

          {progress.hasCertificate && (
            <button
              type="button"
              onClick={() => onOpenCertificate(division.id)}
              className="cta-orange inline-flex items-center gap-2 rounded-xl px-4 py-2 min-h-[42px] text-xs sm:text-sm font-semibold text-white cursor-pointer whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              Lihat Sertifikat
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#2F6BFF]/25 border border-[#5AA2FF]/40 flex items-center justify-center text-[#FFA24D] shrink-0 shadow-[0_0_24px_rgba(47,107,255,0.3)]">
              <DivisionIcon name={division.iconName} className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7FF]">
                {division.name}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#5AA2FF]">
                {division.roles.join(' · ')}
              </p>
              <p className="mt-2 text-sm text-[#A9B8DB] max-w-2xl leading-relaxed">
                {division.description}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-64 shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#A9B8DB] tabular-nums">
              <span>Progres Pelatihan</span>
              <span className="font-semibold text-[#F4F7FF]">
                {progress.completed}/{progress.total} ({progress.percent}%)
              </span>
            </div>
            <ProgressBar value={progress.percent} heightClass="h-2.5" />
            <p className="text-xs text-[#8FA3CE] tabular-nums">
              {progress.bestFinalScore !== null
                ? `Skor Ujian Akhir Terbaik: ${progress.bestFinalScore}%`
                : 'Belum mengerjakan Ujian Akhir (20 soal)'}
            </p>
          </div>
        </div>

        {/* 4 Tabs with Warm Orange Active Underline */}
        <div
          className="flex items-center gap-2 sm:gap-5 border-b border-[#5A96FF]/20 overflow-x-auto -mb-5 sm:-mb-7 pt-1"
          role="tablist"
          aria-label="Tab Divisi"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  onChangeTab(tab.id);
                  onRecordActivity(division.id, undefined, tab.id);
                }}
                className={`relative inline-flex items-center gap-2 pb-3.5 px-2 min-h-[46px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'text-[#F4F7FF]'
                    : 'text-[#A9B8DB] hover:text-[#F4F7FF]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#FFA24D]' : 'text-[#5AA2FF]'}`} />
                <span>{tab.label}</span>
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#FFA24D] shadow-[0_0_12px_rgba(255,122,26,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'guide' && (
          <DivisionGuideTab
            division={division}
            profile={profile}
            cachedGuide={cachedGuide}
            onCacheGuide={onCacheGuide}
          />
        )}

        {activeTab === 'training' && (
          <DivisionTrainingTab
            division={division}
            profile={profile}
            initialModuleId={initialModuleId}
            completedModules={completedModules}
            cachedModules={cachedModules}
            onCacheModule={onCacheModule}
            onToggleComplete={onToggleComplete}
            onMarkComplete={onMarkComplete}
            onStartModuleQuiz={(modId) => {
              setQuizModuleId(modId);
              onChangeTab('quiz');
            }}
            onRecordActivity={(modId) => onRecordActivity(division.id, modId, 'training')}
          />
        )}

        {activeTab === 'quiz' && (
          <DivisionQuizTab
            division={division}
            profile={profile}
            initialModuleId={quizModuleId}
            recentAttempts={divisionAttempts}
            allModulesCompleted={progress.completed === progress.total}
            hasCertificate={progress.hasCertificate}
            onSaveAttempt={onSaveAttempt}
            onOpenCertificate={() => onOpenCertificate(division.id)}
          />
        )}

        {activeTab === 'roleplay' && (
          <DivisionRolePlayTab division={division} profile={profile} />
        )}
      </div>
    </div>
  );
}
