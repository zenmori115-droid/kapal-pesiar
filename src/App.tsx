/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Anchor,
  Award,
  BookMarked,
  Briefcase,
  CheckSquare,
  Compass,
  Home,
  MessageSquare,
  TrendingUp,
  User,
} from 'lucide-react';
import { CertificateModal } from './components/CertificateModal';
import { DashboardView } from './components/DashboardView';
import { DivisionsGridView } from './components/DivisionsGridView';
import { OnboardingModal } from './components/OnboardingModal';
import { ProfileView } from './components/ProfileView';
import { ProgressView } from './components/ProgressView';
import { DivisionDetailView } from './components/division/DivisionDetailView';
import { AiHubView } from './components/tools/AiHubView';
import { AmbientBackground, DisclaimerBanner } from './components/ui/CommonUI';
import { EXPERIENCE_LABELS, getDivisionById } from './data/divisions';
import { useAcademyStore } from './hooks/useAcademyStore';
import { DivisionTab, NavSection, ToolMode } from './types/academy';

export default function App() {
  const store = useAcademyStore();
  const [navSection, setNavSection] = useState<NavSection>('home');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null);
  const [divisionTab, setDivisionTab] = useState<DivisionTab>('guide');
  const [initialModuleId, setInitialModuleId] = useState<string | undefined>(undefined);
  const [activeTool, setActiveTool] = useState<ToolMode>('senior-chat');
  const [certificateDivisionId, setCertificateDivisionId] = useState<string | null>(null);

  const openDivision = (
    divisionId: string,
    tab: DivisionTab = 'guide',
    moduleId?: string
  ) => {
    setSelectedDivisionId(divisionId);
    setDivisionTab(tab);
    setInitialModuleId(moduleId);
    setNavSection('divisions');
    store.recordLastActivity(divisionId, moduleId, tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openTool = (tool: ToolMode) => {
    setActiveTool(tool);
    setSelectedDivisionId(null);
    setNavSection('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (section: NavSection) => {
    setNavSection(section);
    if (section !== 'divisions') {
      setSelectedDivisionId(null);
      setInitialModuleId(undefined);
    } else {
      setSelectedDivisionId(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mainNavItems: { id: NavSection; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'divisions', label: 'Divisi', icon: Compass },
    { id: 'chat', label: 'Tanya AI', icon: MessageSquare },
    { id: 'progress', label: 'Progres', icon: TrendingUp },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  const quickTools: { id: ToolMode; label: string; icon: React.ElementType }[] = [
    { id: 'checklist', label: 'Generator Checklist', icon: CheckSquare },
    { id: 'interview', label: 'Simulasi Wawancara', icon: Briefcase },
    { id: 'glossary', label: 'Kamus Istilah Kapal', icon: BookMarked },
  ];

  const activeDivision = selectedDivisionId
    ? getDivisionById(selectedDivisionId)
    : null;
  const activeCertificate = certificateDivisionId
    ? store.state.certificates[certificateDivisionId]
    : null;

  const viewKey = selectedDivisionId
    ? `division-${selectedDivisionId}`
    : `${navSection}-${navSection === 'chat' ? activeTool : ''}`;

  return (
    <div className="min-h-screen text-[#F4F7FF] relative flex flex-col lg:flex-row">
      <AmbientBackground />

      {/* Desktop Sidebar Navigation */}
      <aside className="no-print hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0 lg:fixed lg:inset-y-0 lg:left-0 bg-[#060E26]/90 backdrop-blur-xl border-r border-[#5A96FF]/20 z-30">
        <div className="p-6 border-b border-[#5A96FF]/15">
          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#2F6BFF] to-[#FF7A1A] flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,122,26,0.42)] group-hover:scale-105 transition-transform">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display text-lg font-extrabold text-[#F4F7FF] block leading-none">
                CruiseCrew
              </span>
              <span className="text-xs font-semibold text-[#FFA24D] tracking-wide">
                Academy
              </span>
            </div>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6" aria-label="Navigasi utama">
          <div className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = navSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 min-h-[46px] text-sm font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#2F6BFF]/25 text-[#F4F7FF] border border-[#5AA2FF]/40 shadow-[0_0_18px_rgba(47,107,255,0.28)]'
                      : 'text-[#A9B8DB] hover:text-[#F4F7FF] hover:bg-[#142864]/35 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      active ? 'text-[#FFA24D]' : 'text-[#5AA2FF]'
                    }`}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#5A96FF]/15 space-y-1.5">
            <p className="px-4 text-xs font-semibold text-[#7F94C2]">
              Alat Persiapan AI
            </p>
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              const active = navSection === 'chat' && activeTool === tool.id;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => openTool(tool.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-2.5 min-h-[44px] text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FF7A1A]/18 text-[#FFA24D] border border-[#FF7A1A]/45'
                      : 'text-[#A9B8DB] hover:text-[#F4F7FF] hover:bg-[#142864]/30 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tool.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Mini Summary Footer in Sidebar */}
        {store.state.profile && (
          <div className="p-4 border-t border-[#5A96FF]/15">
            <button
              type="button"
              onClick={() => handleNavigate('profile')}
              className="w-full rounded-xl bg-[#0B1738]/80 border border-[#5A96FF]/20 hover:border-[#5AA2FF]/45 p-3.5 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm font-bold text-[#F4F7FF] truncate">
                  {store.state.profile.name}
                </p>
                {store.stats.certificatesCount > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#34D399] shrink-0 tabular-nums">
                    <Award className="w-3.5 h-3.5" />
                    {store.stats.certificatesCount}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-[#A9B8DB] truncate">
                {EXPERIENCE_LABELS[store.state.profile.experienceLevel].label} ·{' '}
                {getDivisionById(store.state.profile.targetDivisionId).shortName}
              </p>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Compact Header */}
      <header className="no-print lg:hidden sticky top-0 z-30 h-14 px-4 flex items-center justify-between bg-[#060E26]/90 backdrop-blur-xl border-b border-[#5A96FF]/20">
        <button
          type="button"
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#2F6BFF] to-[#FF7A1A] flex items-center justify-center text-white shadow-[0_0_14px_rgba(255,122,26,0.45)]">
            <Anchor className="w-4 h-4" />
          </div>
          <span className="font-display text-base font-extrabold text-[#F4F7FF] whitespace-nowrap">
            CruiseCrew Academy
          </span>
        </button>

        {store.state.profile && (
          <button
            type="button"
            onClick={() => handleNavigate('profile')}
            className="text-xs font-semibold text-[#FFA24D] truncate max-w-[130px] cursor-pointer min-h-[40px] px-2"
          >
            {store.state.profile.name}
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {navSection === 'home' && (
                <DashboardView
                  profile={store.state.profile}
                  stats={store.stats}
                  lastActivity={store.state.lastActivity}
                  getDivisionProgress={store.getDivisionProgress}
                  onOpenDivision={openDivision}
                  onOpenTool={openTool}
                  onOpenAllDivisions={() => handleNavigate('divisions')}
                />
              )}

              {navSection === 'divisions' && !activeDivision && (
                <DivisionsGridView
                  profile={store.state.profile}
                  getDivisionProgress={store.getDivisionProgress}
                  onOpenDivision={openDivision}
                />
              )}

              {navSection === 'divisions' && activeDivision && (
                <DivisionDetailView
                  division={activeDivision}
                  activeTab={divisionTab}
                  initialModuleId={initialModuleId}
                  profile={store.state.profile}
                  progress={store.getDivisionProgress(activeDivision.id)}
                  completedModules={store.state.completedModules}
                  cachedGuide={store.state.cachedGuides[activeDivision.id]}
                  cachedModules={store.state.cachedModules}
                  quizAttempts={store.state.quizAttempts}
                  onChangeTab={(tab) => {
                    setDivisionTab(tab);
                    if (tab !== 'training') setInitialModuleId(undefined);
                  }}
                  onBack={() => {
                    setSelectedDivisionId(null);
                    setInitialModuleId(undefined);
                  }}
                  onCacheGuide={store.cacheGuide}
                  onCacheModule={store.cacheModule}
                  onToggleComplete={store.toggleModuleComplete}
                  onMarkComplete={store.markModuleComplete}
                  onSaveAttempt={store.addQuizAttempt}
                  onRecordActivity={store.recordLastActivity}
                  onOpenCertificate={(divId) => setCertificateDivisionId(divId)}
                />
              )}

              {navSection === 'chat' && (
                <AiHubView
                  activeTool={activeTool}
                  onChangeTool={setActiveTool}
                  profile={store.state.profile}
                  chatMessages={store.state.seniorChatHistory}
                  onUpdateChat={store.setSeniorChatHistory}
                  savedChecklists={store.state.savedChecklists}
                  onSaveChecklist={store.saveChecklist}
                  onToggleChecklistItem={store.toggleChecklistItem}
                  onDeleteChecklist={store.deleteChecklist}
                  cachedGlossary={store.state.cachedGlossary}
                  onCacheGlossary={store.cacheGlossaryEntry}
                />
              )}

              {navSection === 'progress' && (
                <ProgressView
                  stats={store.stats}
                  quizAttempts={store.state.quizAttempts}
                  certificates={store.state.certificates}
                  getDivisionProgress={store.getDivisionProgress}
                  onOpenDivision={openDivision}
                  onOpenCertificate={(divId) => setCertificateDivisionId(divId)}
                />
              )}

              {navSection === 'profile' && (
                <ProfileView
                  profile={store.state.profile}
                  cachedGuidesCount={Object.keys(store.state.cachedGuides).length}
                  cachedModulesCount={Object.keys(store.state.cachedModules).length}
                  cachedGlossaryCount={Object.keys(store.state.cachedGlossary).length}
                  onUpdateProfile={store.updateProfile}
                  onResetProgress={store.resetProgress}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Permanent Footer with Mandatory Disclaimer */}
        <footer className="no-print w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8 pt-2 space-y-3">
          <DisclaimerBanner compact />
          <p className="text-center text-xs text-[#7B90BE]">
            CruiseCrew Academy · Platform Edukasi & Persiapan Calon Kru Kapal Pesiar Indonesia
          </p>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar (5 Tabs: Beranda, Divisi, Tanya AI, Progres, Profil) */}
      <nav
        aria-label="Navigasi mobile"
        className="no-print lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 bg-[#060E26]/95 backdrop-blur-xl border-t border-[#5A96FF]/25 px-1"
      >
        <div className="grid grid-cols-5 h-full max-w-lg mx-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = navSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 min-h-[44px] text-[11px] font-medium transition-colors cursor-pointer ${
                  active ? 'text-[#FFA24D]' : 'text-[#8FA3CE] hover:text-[#F4F7FF]'
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-3 right-3 h-[2.5px] rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#FFA24D]" />
                )}
                <Icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* First-Visit Onboarding Modal */}
      {!store.state.profile?.onboarded && (
        <OnboardingModal onComplete={store.updateProfile} />
      )}

      {/* Printable Digital Certificate Modal */}
      {activeCertificate && (
        <CertificateModal
          certificate={activeCertificate}
          onClose={() => setCertificateDivisionId(null)}
        />
      )}
    </div>
  );
}
