import { LICENSE_CLASSES } from '@/data/licenseClasses';
import type { ExamResult, ExamRules, LicenseClassId, Question } from '@/types';

/** The 20 fixed exams follow the class B structure: 30 questions, 20 minutes, pass at 27. */
export const FIXED_EXAM_RULES: ExamRules = { questionCount: 30, durationSec: 20 * 60, passCount: 27 };

const CRITICAL_PER_EXAM = 3;
const PRACTICE_PASS_RATIO = 0.9;

/** Exam structure for a license class, from licenseClasses.json. */
export const examRulesFor = (licenseClass: LicenseClassId): ExamRules => {
  const exam = LICENSE_CLASSES.find((c) => c.id === licenseClass)?.exam;
  if (!exam) return FIXED_EXAM_RULES;
  return { questionCount: exam.questionCount, durationSec: exam.timeMinutes * 60, passCount: exam.passingScore };
};

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

/** A random exam of `size` questions with a few critical (điểm liệt) questions mixed in. */
export const makeRandomExam = (questions: Question[], size: number) => {
  const critical = shuffle(questions.filter((q) => q.isCritical)).slice(0, CRITICAL_PER_EXAM);
  const rest = shuffle(questions.filter((q) => !q.isCritical)).slice(0, size - critical.length);
  return shuffle([...critical, ...rest]);
};

/** Grades answers. Without `passCount` (practice) the pass mark is 90%. */
export const gradeExam = (questions: Question[], picked: Record<number, number>, passCount?: number): ExamResult => {
  const correct = questions.filter((q) => picked[q.id] === q.answer).length;
  const criticalFailed = questions.some((q) => q.isCritical && picked[q.id] !== q.answer);
  const needed = passCount ?? Math.ceil(questions.length * PRACTICE_PASS_RATIO - 1e-9);
  return { total: questions.length, correct, passCount: needed, criticalFailed, passed: !criticalFailed && correct >= needed };
};
