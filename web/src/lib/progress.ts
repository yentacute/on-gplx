// Learner progress kept in the browser (localStorage). Every read and write is guarded: storage can
// be missing or blocked (private mode), and the site must still work without it.
import { useEffect, useState } from 'react';

const KEYS = {
  licenseClass: 'gplx.class',
  answers: 'gplx.answers',
  exams: 'gplx.exams',
  saved: 'gplx.saved',
  time: 'gplx.time',
  history: 'gplx.history',
} as const;

const CHANGE_EVENT = 'gplx:progress';

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: progress just isn't remembered.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const DEFAULT_CLASS = 'B';

export const getLicenseClass = () => read<string>(KEYS.licenseClass, DEFAULT_CLASS);
export const setLicenseClass = (id: string) => write(KEYS.licenseClass, id);

/** Last answer picked for each question id, whether it was right, and how often it was ever wrong. */
export type AnswerEntry = { picked: number; correct: boolean; wrong?: number; tries?: number };
export type AnswerLog = Record<number, AnswerEntry>;
export const getAnswers = () => read<AnswerLog>(KEYS.answers, {});

const nextEntry = (prev: AnswerEntry | undefined, picked: number, correct: boolean): AnswerEntry => ({
  picked,
  correct,
  wrong: (prev?.wrong ?? 0) + (correct ? 0 : 1),
  tries: (prev?.tries ?? 0) + 1,
});
export const recordAnswer = (questionId: number, picked: number, correct: boolean) => {
  const log = getAnswers();
  write(KEYS.answers, { ...log, [questionId]: nextEntry(log[questionId], picked, correct) });
};
export const recordAnswers = (entries: { id: number; picked: number; correct: boolean }[]) => {
  const log = getAnswers();
  for (const { id, picked, correct } of entries) log[id] = nextEntry(log[id], picked, correct);
  write(KEYS.answers, log);
};

/** Questions to drill: last answer wrong, or wrong at least twice. Most-missed first. */
export const weakQuestionIds = (log: AnswerLog) =>
  Object.entries(log)
    .filter(([, a]) => !a.correct || (a.wrong ?? 0) >= 2)
    .sort(([, a], [, b]) => (b.wrong ?? 1) - (a.wrong ?? 1))
    .map(([id]) => Number(id));
export const resetAnswers = (ids?: number[]) => {
  if (!ids) return write(KEYS.answers, {});
  const log = getAnswers();
  for (const id of ids) delete log[id];
  write(KEYS.answers, log);
};

/** Best result per exam key, e.g. "B-3". */
export type ExamScore = { correct: number; total: number; passed: boolean; at: number };
export const getExamScores = () => read<Record<string, ExamScore>>(KEYS.exams, {});
export const recordExamScore = (key: string, score: ExamScore) => write(KEYS.exams, { ...getExamScores(), [key]: score });

/** Bookmarked question ids, newest first. */
export const getSaved = () => read<number[]>(KEYS.saved, []);
export const toggleSaved = (id: number) => {
  const saved = getSaved();
  write(KEYS.saved, saved.includes(id) ? saved.filter((x) => x !== id) : [id, ...saved]);
};

/** Seconds spent on practice and exam screens. */
export const getStudySeconds = () => read<number>(KEYS.time, 0);
export const addStudySeconds = (seconds: number) => {
  if (seconds > 0) write(KEYS.time, getStudySeconds() + Math.round(seconds));
};

/** Every submitted exam, newest first (last 50). */
export type ExamAttempt = { key: string; title: string; correct: number; total: number; passed: boolean; at: number; seconds: number };
export const getExamHistory = () => read<ExamAttempt[]>(KEYS.history, []);
export const recordExamAttempt = (attempt: ExamAttempt) => write(KEYS.history, [attempt, ...getExamHistory()].slice(0, 50));

/** Re-renders when progress changes, in this tab or another one. Returns `fallback` until mounted. */
export const useStored = <T,>(get: () => T, fallback: T): T => {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    const update = () => setValue(get());
    update();
    window.addEventListener(CHANGE_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(CHANGE_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);
  return value;
};

/** The whole question bank as JSON, fetched once per page for the quiz and exam screens. */
let questionsPromise: Promise<import('./types').Question[]> | undefined;
export const loadQuestions = () => {
  questionsPromise ??= fetch('/data/questions.json').then((r) => r.json());
  return questionsPromise;
};
