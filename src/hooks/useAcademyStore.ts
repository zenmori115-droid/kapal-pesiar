import { useCallback, useEffect, useMemo, useState } from 'react';
import { DIVISIONS, getDivisionById } from '../data/divisions';
import {
  AcademyStorageState,
  CertificateRecord,
  ChatMessage,
  DivisionGuideData,
  DivisionTab,
  GlossaryEntry,
  ModuleContentData,
  QuizAttempt,
  SavedChecklist,
  UserProfile,
} from '../types/academy';

const STORAGE_KEY = 'cruisecrew_academy_v1';

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DEFAULT_STATE: AcademyStorageState = {
  profile: null,
  completedModules: {},
  quizAttempts: [],
  lastActivity: null,
  streak: {
    count: 1,
    lastActiveDate: getTodayKey(),
  },
  cachedGuides: {},
  cachedModules: {},
  cachedGlossary: {},
  seniorChatHistory: [],
  savedChecklists: [],
  certificates: {},
};

function loadInitialState(): AcademyStorageState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AcademyStorageState>;
    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    const prevStreak = parsed.streak || { count: 1, lastActiveDate: today };

    let nextStreak = prevStreak;
    if (prevStreak.lastActiveDate !== today) {
      if (prevStreak.lastActiveDate === yesterday) {
        nextStreak = { count: prevStreak.count + 1, lastActiveDate: today };
      } else {
        nextStreak = { count: 1, lastActiveDate: today };
      }
    }

    return {
      ...DEFAULT_STATE,
      ...parsed,
      streak: nextStreak,
      completedModules: parsed.completedModules || {},
      quizAttempts: parsed.quizAttempts || [],
      cachedGuides: parsed.cachedGuides || {},
      cachedModules: parsed.cachedModules || {},
      cachedGlossary: parsed.cachedGlossary || {},
      seniorChatHistory: parsed.seniorChatHistory || [],
      savedChecklists: parsed.savedChecklists || [],
      certificates: parsed.certificates || {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function generateCertCode(divisionId: string): string {
  const prefix = divisionId.slice(0, 3).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  const year = new Date().getFullYear();
  return `CCA-${prefix}-${year}-${rand}`;
}

function checkAndAwardCertificate(
  next: AcademyStorageState,
  divisionId: string
): AcademyStorageState {
  const division = getDivisionById(divisionId);
  const allModulesDone = division.modules.every((m) => Boolean(next.completedModules[m.id]));
  const finalExams = next.quizAttempts.filter(
    (q) => q.divisionId === divisionId && q.moduleId === 'final-exam' && q.passed
  );
  if (!allModulesDone || finalExams.length === 0) return next;

  const bestScore = Math.max(...finalExams.map((e) => e.score));
  const existing = next.certificates[divisionId];
  const cert: CertificateRecord = {
    divisionId,
    divisionName: division.name,
    userName: next.profile?.name || 'Calon Kru Kapal Pesiar',
    finalExamScore: Math.max(bestScore, existing?.finalExamScore || 0),
    completedDate: existing?.completedDate || new Date().toISOString(),
    certificateCode: existing?.certificateCode || generateCertCode(divisionId),
  };

  return {
    ...next,
    certificates: {
      ...next.certificates,
      [divisionId]: cert,
    },
  };
}

export function useAcademyStore() {
  const [state, setState] = useState<AcademyStorageState>(() => loadInitialState());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('Gagal menyimpan progres ke localStorage:', err);
    }
  }, [state]);

  const updateProfile = useCallback((profile: UserProfile) => {
    setState((prev) => {
      const updatedCertificates: Record<string, CertificateRecord> = {};
      for (const [key, cert] of Object.entries(prev.certificates)) {
        updatedCertificates[key] = { ...cert, userName: profile.name };
      }
      return {
        ...prev,
        profile,
        certificates: updatedCertificates,
      };
    });
  }, []);

  const recordLastActivity = useCallback(
    (divisionId: string, moduleId?: string, tab?: DivisionTab) => {
      setState((prev) => ({
        ...prev,
        lastActivity: {
          divisionId,
          moduleId,
          tab,
          updatedAt: new Date().toISOString(),
        },
      }));
    },
    []
  );

  const toggleModuleComplete = useCallback((divisionId: string, moduleId: string) => {
    setState((prev) => {
      const nextCompleted = { ...prev.completedModules };
      if (nextCompleted[moduleId]) {
        delete nextCompleted[moduleId];
      } else {
        nextCompleted[moduleId] = new Date().toISOString();
      }
      const nextState: AcademyStorageState = {
        ...prev,
        completedModules: nextCompleted,
        lastActivity: {
          divisionId,
          moduleId,
          tab: 'training',
          updatedAt: new Date().toISOString(),
        },
      };
      return checkAndAwardCertificate(nextState, divisionId);
    });
  }, []);

  const markModuleComplete = useCallback((divisionId: string, moduleId: string) => {
    setState((prev) => {
      if (prev.completedModules[moduleId]) return prev;
      const nextState: AcademyStorageState = {
        ...prev,
        completedModules: {
          ...prev.completedModules,
          [moduleId]: new Date().toISOString(),
        },
        lastActivity: {
          divisionId,
          moduleId,
          tab: 'training',
          updatedAt: new Date().toISOString(),
        },
      };
      return checkAndAwardCertificate(nextState, divisionId);
    });
  }, []);

  const addQuizAttempt = useCallback((attempt: QuizAttempt) => {
    setState((prev) => {
      const nextState: AcademyStorageState = {
        ...prev,
        quizAttempts: [attempt, ...prev.quizAttempts].slice(0, 100),
        lastActivity: {
          divisionId: attempt.divisionId,
          moduleId: attempt.moduleId === 'final-exam' ? undefined : attempt.moduleId,
          tab: 'quiz',
          updatedAt: new Date().toISOString(),
        },
      };
      return checkAndAwardCertificate(nextState, attempt.divisionId);
    });
  }, []);

  const cacheGuide = useCallback((guide: DivisionGuideData) => {
    setState((prev) => ({
      ...prev,
      cachedGuides: { ...prev.cachedGuides, [guide.divisionId]: guide },
    }));
  }, []);

  const cacheModule = useCallback((content: ModuleContentData) => {
    setState((prev) => ({
      ...prev,
      cachedModules: { ...prev.cachedModules, [content.moduleId]: content },
    }));
  }, []);

  const cacheGlossaryEntry = useCallback((termKey: string, entry: GlossaryEntry) => {
    const normalizedKey = termKey.trim().toLowerCase();
    setState((prev) => ({
      ...prev,
      cachedGlossary: { ...prev.cachedGlossary, [normalizedKey]: entry },
    }));
  }, []);

  const setSeniorChatHistory = useCallback(
    (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
      setState((prev) => ({
        ...prev,
        seniorChatHistory:
          typeof updater === 'function' ? updater(prev.seniorChatHistory) : updater,
      }));
    },
    []
  );

  const saveChecklist = useCallback((checklist: SavedChecklist) => {
    setState((prev) => ({
      ...prev,
      savedChecklists: [
        checklist,
        ...prev.savedChecklists.filter((c) => c.id !== checklist.id),
      ].slice(0, 20),
    }));
  }, []);

  const toggleChecklistItem = useCallback((checklistId: string, itemId: string) => {
    setState((prev) => ({
      ...prev,
      savedChecklists: prev.savedChecklists.map((cl) => {
        if (cl.id !== checklistId) return cl;
        return {
          ...cl,
          categories: cl.categories.map((cat) => ({
            ...cat,
            items: cat.items.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          })),
        };
      }),
    }));
  }, []);

  const deleteChecklist = useCallback((checklistId: string) => {
    setState((prev) => ({
      ...prev,
      savedChecklists: prev.savedChecklists.filter((c) => c.id !== checklistId),
    }));
  }, []);

  const resetProgress = useCallback((keepProfile = true) => {
    setState((prev) => ({
      ...DEFAULT_STATE,
      profile: keepProfile ? prev.profile : null,
      streak: { count: 1, lastActiveDate: getTodayKey() },
    }));
  }, []);

  const stats = useMemo(() => {
    const totalModules = DIVISIONS.reduce((acc, d) => acc + d.modules.length, 0);
    const completedCount = Object.keys(state.completedModules).length;
    const averageScore =
      state.quizAttempts.length > 0
        ? Math.round(
            state.quizAttempts.reduce((acc, q) => acc + q.score, 0) /
              state.quizAttempts.length
          )
        : 0;
    const activeDivisionIds = new Set<string>();
    for (const div of DIVISIONS) {
      const hasDone = div.modules.some((m) => Boolean(state.completedModules[m.id]));
      const hasQuiz = state.quizAttempts.some((q) => q.divisionId === div.id);
      if (hasDone || hasQuiz) activeDivisionIds.add(div.id);
    }
    if (state.profile?.targetDivisionId) {
      activeDivisionIds.add(state.profile.targetDivisionId);
    }
    return {
      totalModules,
      completedCount,
      averageScore,
      streakDays: state.streak.count,
      activeDivisionsCount: activeDivisionIds.size,
      certificatesCount: Object.keys(state.certificates).length,
    };
  }, [state]);

  const getDivisionProgress = useCallback(
    (divisionId: string) => {
      const division = getDivisionById(divisionId);
      const total = division.modules.length;
      const completed = division.modules.filter((m) =>
        Boolean(state.completedModules[m.id])
      ).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const finalExams = state.quizAttempts.filter(
        (q) => q.divisionId === divisionId && q.moduleId === 'final-exam'
      );
      const bestFinalScore =
        finalExams.length > 0 ? Math.max(...finalExams.map((e) => e.score)) : null;
      const passedFinal = bestFinalScore !== null && bestFinalScore >= 70;
      return {
        total,
        completed,
        percent,
        bestFinalScore,
        passedFinal,
        hasCertificate: Boolean(state.certificates[divisionId]),
      };
    },
    [state.completedModules, state.quizAttempts, state.certificates]
  );

  return {
    state,
    stats,
    getDivisionProgress,
    updateProfile,
    recordLastActivity,
    toggleModuleComplete,
    markModuleComplete,
    addQuizAttempt,
    cacheGuide,
    cacheModule,
    cacheGlossaryEntry,
    setSeniorChatHistory,
    saveChecklist,
    toggleChecklistItem,
    deleteChecklist,
    resetProgress,
  };
}
