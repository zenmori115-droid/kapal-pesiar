export type ExperienceLevel = 'pemula' | 'hospitality' | 'berpengalaman';

export type NavSection = 'home' | 'divisions' | 'chat' | 'progress' | 'profile';

export type DivisionTab = 'guide' | 'training' | 'quiz' | 'roleplay';

export type ToolMode = 'senior-chat' | 'checklist' | 'interview' | 'glossary';

export type ModuleLevel = 1 | 2 | 3;

export interface UserProfile {
  name: string;
  targetDivisionId: string;
  experienceLevel: ExperienceLevel;
  onboarded: boolean;
  createdAt: string;
}

export interface ModuleBlueprint {
  id: string;
  divisionId: string;
  level: ModuleLevel;
  levelLabel: 'Level 1 — Dasar' | 'Level 2 — Menengah' | 'Level 3 — Mahir';
  order: number;
  title: string;
  summary: string;
  estimatedMinutes: number;
}

export interface RolePlayScenario {
  id: string;
  title: string;
  description: string;
  defaultRole: 'guest' | 'supervisor' | 'interviewer';
}

export interface Division {
  id: string;
  name: string;
  shortName: string;
  category: 'mandatory' | 'hotel' | 'technical' | 'safety';
  iconName:
    | 'ShieldAlert'
    | 'BedDouble'
    | 'UtensilsCrossed'
    | 'Wine'
    | 'ChefHat'
    | 'ConciergeBell'
    | 'Music'
    | 'Sparkles'
    | 'Camera'
    | 'Compass'
    | 'Wrench'
    | 'HeartPulse';
  roles: string[];
  description: string;
  modules: ModuleBlueprint[];
  rolePlayScenarios: RolePlayScenario[];
}

export interface DivisionGuideData {
  divisionId: string;
  generatedAt: string;
  overview: string;
  dailyTasks: string[];
  careerPath: {
    position: string;
    level: string;
    responsibility: string;
  }[];
  groomingAndBehavior: string[];
  coreSops: {
    title: string;
    steps: string[];
  }[];
  commonMistakes: {
    mistake: string;
    howToAvoid: string;
  }[];
  glossary: {
    term: string;
    meaning: string;
  }[];
}

export interface ModuleContentData {
  moduleId: string;
  generatedAt: string;
  learningObjectives: string[];
  sections: {
    heading: string;
    explanation: string;
    keyAction: string;
  }[];
  realShipScenario: {
    title: string;
    situation: string;
    bestResponse: string;
  };
  seniorTips: string[];
  keyTakeaways: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  divisionId: string;
  moduleId: string | 'final-exam';
  title: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  passed: boolean;
  date: string;
}

export interface RolePlayMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface RolePlayEvaluation {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  betterResponses: {
    situation: string;
    suggestedReply: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  note: string;
  checked: boolean;
}

export interface ChecklistCategory {
  category: string;
  items: ChecklistItem[];
}

export interface SavedChecklist {
  id: string;
  divisionId: string;
  divisionName: string;
  situation: string;
  title: string;
  categories: ChecklistCategory[];
  createdAt: string;
}

export interface InterviewTurn {
  questionNumber: number;
  question: string;
  tip?: string;
  userAnswer?: string;
}

export interface InterviewFeedback {
  overallScore: number;
  communicationScore: number;
  technicalScore: number;
  serviceMindsetScore: number;
  verdict: string;
  strengths: string[];
  improvements: string[];
  sampleAnswers: {
    question: string;
    idealAnswer: string;
  }[];
}

export interface GlossaryEntry {
  term: string;
  pronunciationHint: string;
  shortDefinition: string;
  shipContextExample: string;
  relatedDivisions: string[];
  newCrewTip: string;
  cachedAt: string;
}

export interface CertificateRecord {
  divisionId: string;
  divisionName: string;
  userName: string;
  finalExamScore: number;
  completedDate: string;
  certificateCode: string;
}

export interface AcademyStorageState {
  profile: UserProfile | null;
  completedModules: Record<string, string>; // moduleId -> ISO date
  quizAttempts: QuizAttempt[];
  lastActivity: {
    divisionId: string;
    moduleId?: string;
    tab?: DivisionTab;
    updatedAt: string;
  } | null;
  streak: {
    count: number;
    lastActiveDate: string; // YYYY-MM-DD
  };
  cachedGuides: Record<string, DivisionGuideData>;
  cachedModules: Record<string, ModuleContentData>;
  cachedGlossary: Record<string, GlossaryEntry>;
  seniorChatHistory: ChatMessage[];
  savedChecklists: SavedChecklist[];
  certificates: Record<string, CertificateRecord>;
}
