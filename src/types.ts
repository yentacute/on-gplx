export type LicenseGroup = 'moto' | 'car';

export type LicenseClassId =
  | 'A1' | 'A' | 'B1'
  | 'B' | 'C1' | 'C' | 'D1' | 'D2' | 'D'
  | 'BE' | 'C1E' | 'CE' | 'D1E' | 'D2E' | 'DE';

export type LicenseClass = {
  id: LicenseClassId;
  group: LicenseGroup;
  title: string;
  minAge: number;
  description: string;
  exam: { questionCount: number; timeMinutes: number; passingScore: number };
};

export type ExamVersion = 'new' | 'old';

export type Topic = 'rules' | 'culture' | 'technique' | 'signs' | 'situations';

export type Question = {
  id: number;
  text: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  hint?: string;
  explanation?: string;
  isCritical: boolean;
  category: string;
  topic: Topic;
  /** License classes this question is used for, e.g. `B`, `C1`. */
  licenseTypes: string[];
  /** Keys into QUESTION_IMAGES, e.g. `q227.jpg`. */
  images?: string[];
};

/** Shape of one entry in src/data/questions.json (the 600-question bank). */
export type RawQuestion = {
  id: number;
  questionNumber: number;
  category: string;
  licenseTypes: string[];
  isPointDeduction: boolean;
  examFormat: string;
  question: string;
  hasImage: boolean;
  options: Partial<Record<'a' | 'b' | 'c' | 'd', string>>;
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
  references?: unknown;
  difficulty?: unknown;
  topics?: unknown;
  createdAt?: string;
  updatedAt?: string;
  image?: string | null;
};

export type SignGroup = 'nguyhiem' | 'cam' | 'hieulenh' | 'chidan' | 'phu' | 'vachke';

export type TrafficSign = {
  id: string;
  group: SignGroup;
  name: string;
  meaning: string;
  image?: string;
};

export type Exam = { id: number; questionIds: number[] };

export type ExamResult = {
  total: number;
  correct: number;
  /** Correct answers needed to pass. */
  passCount: number;
  criticalFailed: boolean;
  passed: boolean;
};

/** Exam structure: number of questions, time limit and pass mark. */
export type ExamRules = { questionCount: number; durationSec: number; passCount: number };

export type ExamScore = { correct: number; total: number; passed: boolean };

export type ExamDraft = { picked: Record<number, number>; index: number; remainingSec: number };

export type ExamReveal = 'instant' | 'end';

export type QuizMode = 'practice' | 'critical' | 'wrong' | 'exam';

export type TipPoint = { text: string; kind?: 'do' | 'dont' | 'info' };

export type TipStat = { label: string; value: number; detail: string; chance?: number };

export type Tip = {
  title: string;
  takeaway: string;
  points?: TipPoint[];
  stats?: TipStat[];
  questions?: number[];
};

export type TipSection = {
  id: string;
  short: string;
  title: string;
  summary: string;
  icon: string;
  color: string;
  tips: Tip[];
};
