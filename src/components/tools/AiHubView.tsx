import React from 'react';
import {
  BookMarked,
  Briefcase,
  CheckSquare,
  MessageSquare,
} from 'lucide-react';
import {
  ChatMessage,
  GlossaryEntry,
  SavedChecklist,
  ToolMode,
  UserProfile,
} from '../../types/academy';
import { ChecklistTool } from './ChecklistTool';
import { GlossaryTool } from './GlossaryTool';
import { InterviewTool } from './InterviewTool';
import { SeniorChatTool } from './SeniorChatTool';

interface AiHubViewProps {
  activeTool: ToolMode;
  onChangeTool: (tool: ToolMode) => void;
  profile: UserProfile | null;
  chatMessages: ChatMessage[];
  onUpdateChat: (
    updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void;
  savedChecklists: SavedChecklist[];
  onSaveChecklist: (cl: SavedChecklist) => void;
  onToggleChecklistItem: (checklistId: string, itemId: string) => void;
  onDeleteChecklist: (checklistId: string) => void;
  cachedGlossary: Record<string, GlossaryEntry>;
  onCacheGlossary: (termKey: string, entry: GlossaryEntry) => void;
}

const TOOL_TABS: { id: ToolMode; label: string; icon: React.ElementType }[] = [
  { id: 'senior-chat', label: 'Tanya Senior AI', icon: MessageSquare },
  { id: 'checklist', label: 'Generator Checklist', icon: CheckSquare },
  { id: 'interview', label: 'Simulasi Wawancara', icon: Briefcase },
  { id: 'glossary', label: 'Kamus Istilah', icon: BookMarked },
];

export function AiHubView({
  activeTool,
  onChangeTool,
  profile,
  chatMessages,
  onUpdateChat,
  savedChecklists,
  onSaveChecklist,
  onToggleChecklistItem,
  onDeleteChecklist,
  cachedGlossary,
  onCacheGlossary,
}: AiHubViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7FF]">
          Asisten & Alat Latihan AI
        </h1>
        <p className="mt-1 text-sm text-[#A9B8DB]">
          Tanya langsung ke Senior Officer, susun checklist sign-on, latihan wawancara kerja, dan cari istilah kapal pesiar.
        </p>
      </div>

      {/* Tool Tabs with Warm Orange Active Underline */}
      <div
        className="flex items-center gap-2 sm:gap-5 border-b border-[#5A96FF]/20 overflow-x-auto"
        role="tablist"
        aria-label="Alat Latihan AI"
      >
        {TOOL_TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTool === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChangeTool(t.id)}
              className={`relative inline-flex items-center gap-2 pb-3.5 px-2 min-h-[46px] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                active ? 'text-[#F4F7FF]' : 'text-[#A9B8DB] hover:text-[#F4F7FF]'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-[#FFA24D]' : 'text-[#5AA2FF]'}`} />
              <span>{t.label}</span>
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#FFA24D] shadow-[0_0_12px_rgba(255,122,26,0.8)]" />
              )}
            </button>
          );
        })}
      </div>

      {activeTool === 'senior-chat' && (
        <SeniorChatTool
          profile={profile}
          messages={chatMessages}
          onUpdateMessages={onUpdateChat}
        />
      )}

      {activeTool === 'checklist' && (
        <ChecklistTool
          profile={profile}
          savedChecklists={savedChecklists}
          onSaveChecklist={onSaveChecklist}
          onToggleItem={onToggleChecklistItem}
          onDeleteChecklist={onDeleteChecklist}
        />
      )}

      {activeTool === 'interview' && <InterviewTool profile={profile} />}

      {activeTool === 'glossary' && (
        <GlossaryTool
          profile={profile}
          cachedGlossary={cachedGlossary}
          onCacheEntry={onCacheGlossary}
        />
      )}
    </div>
  );
}
