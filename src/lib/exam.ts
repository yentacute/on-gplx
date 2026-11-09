import type { ExamResult, Question } from '@/types';

export const EXAM_SIZE = 30;
export const PASS_RATIO = 0.9;
export const PASS_COUNT = Math.ceil(EXAM_SIZE * PASS_RATIO);
export const EXAM_DURATION_SEC = 20 * 60;
const CRITICAL_PER_EXAM = 3;

/** Seconds to `mm:ss`. */
export const formatTime = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const shuffle = <T,>(items: readonly T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

/** A random exam with a few critical questions mixed in. */
export const makeRandomExam = (questions: Question[]) => {
  const critical = shuffle(questions.filter((q) => q.isCritical)).slice(0, CRITICAL_PER_EXAM);
  const rest = shuffle(questions.filter((q) => !q.isCritical)).slice(0, EXAM_SIZE - critical.length);
  return shuffle([...critical, ...rest]);
};

export const gradeExam = (questions: Question[], picked: Record<number, number>): ExamResult => {
  const correct = questions.filter((q) => picked[q.id] === q.answer).length;
  const criticalFailed = questions.some((q) => q.isCritical && picked[q.id] !== q.answer);
  const passed = !criticalFailed && correct >= Math.ceil(questions.length * PASS_RATIO - 1e-9);
  return { total: questions.length, correct, criticalFailed, passed };
};
