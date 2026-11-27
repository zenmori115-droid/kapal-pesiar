import {
  DivisionGuideData,
  GlossaryEntry,
  InterviewFeedback,
  InterviewTurn,
  ModuleContentData,
  QuizQuestion,
  RolePlayEvaluation,
  RolePlayMessage,
  UserProfile,
} from '../types/academy';

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.error ||
        'Gagal menghubungi Senior AI. Silakan periksa koneksi lalu tekan Coba Lagi.'
    );
  }
  return data as T;
}

export async function fetchDivisionGuide(params: {
  divisionId: string;
  divisionName: string;
  roles: string[];
  description: string;
  profile: UserProfile | null;
}): Promise<DivisionGuideData> {
  const raw = await postJson<Omit<DivisionGuideData, 'divisionId' | 'generatedAt'>>(
    '/api/ai/guide',
    params
  );
  return {
    ...raw,
    divisionId: params.divisionId,
    generatedAt: new Date().toISOString(),
  };
}

export async function fetchModuleContent(params: {
  moduleId: string;
  divisionName: string;
  moduleTitle: string;
  moduleLevel: string;
  moduleSummary: string;
  profile: UserProfile | null;
}): Promise<ModuleContentData> {
  const raw = await postJson<Omit<ModuleContentData, 'moduleId' | 'generatedAt'>>(
    '/api/ai/module',
    params
  );
  return {
    ...raw,
    moduleId: params.moduleId,
    generatedAt: new Date().toISOString(),
  };
}

export async function fetchQuizQuestions(params: {
  divisionName: string;
  moduleTitle?: string;
  moduleTitles?: string[];
  questionCount?: number;
  isFinalExam?: boolean;
  profile: UserProfile | null;
}): Promise<QuizQuestion[]> {
  const data = await postJson<{ questions: QuizQuestion[] }>('/api/ai/quiz', params);
  return data.questions || [];
}

export async function sendRolePlayTurn(params: {
  divisionName: string;
  scenarioTitle: string;
  scenarioDescription: string;
  counterpartRole: 'guest' | 'supervisor' | 'interviewer';
  difficulty: 'ramah' | 'sedang' | 'sulit';
  language: 'id' | 'en';
  history: RolePlayMessage[];
  profile: UserProfile | null;
}): Promise<string> {
  const data = await postJson<{ reply: string }>('/api/ai/roleplay/turn', params);
  return data.reply;
}

export async function evaluateRolePlay(params: {
  divisionName: string;
  scenarioTitle: string;
  counterpartRole: 'guest' | 'supervisor' | 'interviewer';
  difficulty: 'ramah' | 'sedang' | 'sulit';
  language: 'id' | 'en';
  history: RolePlayMessage[];
  profile: UserProfile | null;
}): Promise<RolePlayEvaluation> {
  return postJson<RolePlayEvaluation>('/api/ai/roleplay/evaluate', params);
}

export async function sendSeniorChatMessage(params: {
  history: { role: 'user' | 'model'; text: string }[];
  message: string;
  profile: UserProfile | null;
}): Promise<string> {
  const data = await postJson<{ reply: string }>('/api/ai/chat', params);
  return data.reply;
}

export async function generateChecklist(params: {
  divisionName: string;
  situation: string;
  profile: UserProfile | null;
}): Promise<{
  title: string;
  categories: { category: string; items: { text: string; note: string }[] }[];
}> {
  return postJson('/api/ai/checklist', params);
}

export async function startInterviewSession(params: {
  divisionName: string;
  roles: string[];
  language: 'id' | 'en';
  profile: UserProfile | null;
}): Promise<{
  greeting: string;
  questions: { question: string; tip: string }[];
}> {
  return postJson('/api/ai/interview/start', params);
}

export async function evaluateInterviewSession(params: {
  divisionName: string;
  language: 'id' | 'en';
  turns: InterviewTurn[];
  profile: UserProfile | null;
}): Promise<InterviewFeedback> {
  return postJson('/api/ai/interview/evaluate', params);
}

export async function lookupGlossaryTerm(params: {
  term: string;
  profile: UserProfile | null;
}): Promise<GlossaryEntry> {
  const raw = await postJson<Omit<GlossaryEntry, 'cachedAt'>>('/api/ai/glossary', params);
  return {
    ...raw,
    cachedAt: new Date().toISOString(),
  };
}
