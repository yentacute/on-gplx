// Learner progress kept in the browser (localStorage). Every read and write is guarded: storage can
// be missing or blocked (private mode), and the site must still work without it.
import { useEffect, useState } from 'react';

const KEYS = {
  licenseClass: 'gplx.class',
  answers: 'gplx.answers',
  exams: 'gplx.exams',
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

/** Last answer picked for each question id, and whether it was right. */
export type AnswerLog = Record<number, { picked: number; correct: boolean }>;
export const getAnswers = () => read<AnswerLog>(KEYS.answers, {});
export const recordAnswer = (questionId: number, picked: number, correct: boolean) =>
  write(KEYS.answers, { ...getAnswers(), [questionId]: { picked, correct } });
export const recordAnswers = (entries: { id: number; picked: number; correct: boolean }[]) => {
  const log = getAnswers();
  for (const { id, picked, correct } of entries) log[id] = { picked, correct };
  write(KEYS.answers, log);
};
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
