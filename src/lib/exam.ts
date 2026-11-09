import { EXAMS, questionsForClass } from '@/data';
import { LICENSE_CLASSES } from '@/data/licenseClasses';
import type { Exam, ExamResult, ExamRules, LicenseClassId, Question } from '@/types';

/** Class B rules, used when a class is missing from licenseClasses.json. */
const DEFAULT_RULES: ExamRules = { questionCount: 30, durationSec: 20 * 60, passCount: 27 };
const FIXED_EXAM_COUNT = 20;

const CRITICAL_PER_EXAM = 3;
const PRACTICE_PASS_RATIO = 0.9;

/** Exam structure for a license class, from licenseClasses.json. */
export const examRulesFor = (licenseClass: LicenseClassId): ExamRules => {
  const exam = LICENSE_CLASSES.find((c) => c.id === licenseClass)?.exam;
  if (!exam) return DEFAULT_RULES;
  return { questionCount: exam.questionCount, durationSec: exam.timeMinutes * 60, passCount: exam.passingScore };
};

/** Seconds to `mm:ss`. */
export const formatTime = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

type Random = () => number;

/** Small seeded PRNG (mulberry32) so generated fixed exams are the same on every launch. */
const seededRandom = (seed: number): Random => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const hashText = (text: string) => [...text].reduce((hash, ch) => Math.imul(hash, 31) + ch.charCodeAt(0), 7);

export const shuffle = <T>(items: readonly T[], random: Random = Math.random): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

/** A random exam of `size` questions with a few critical (điểm liệt) questions mixed in. */
export const makeRandomExam = (questions: Question[], size: number, random: Random = Math.random) => {
  const critical = shuffle(
    questions.filter((q) => q.isCritical),
    random,
  ).slice(0, CRITICAL_PER_EXAM);
  const rest = shuffle(
    questions.filter((q) => !q.isCritical),
    random,
  ).slice(0, size - critical.length);
  return shuffle([...critical, ...rest], random);
};

const fixedExamCache = new Map<LicenseClassId, Exam[]>();

/**
 * The 20 fixed exams for a class, sized by its rules. Class B uses the hand-picked set in
 * exams.json; other classes get exams generated from a seed, so they stay the same between launches.
 */
export const fixedExamsFor = (licenseClass: LicenseClassId): Exam[] => {
  const cached = fixedExamCache.get(licenseClass);
  if (cached) return cached;
  const { questionCount } = examRulesFor(licenseClass);
  const pool = questionsForClass(licenseClass);
  const handPicked = licenseClass === 'B' && EXAMS.every((e) => e.questionIds.length === questionCount);
  const exams = handPicked
    ? EXAMS
    : Array.from({ length: pool.length > 0 ? FIXED_EXAM_COUNT : 0 }, (_, index) => ({
        id: index + 1,
        questionIds: makeRandomExam(pool, questionCount, seededRandom(hashText(licenseClass) + index)).map((q) => q.id),
      }));
  fixedExamCache.set(licenseClass, exams);
  return exams;
};

/** Storage key for a fixed exam's score and draft. Class B keeps the plain id so saved progress survives. */
export const fixedExamKey = (licenseClass: LicenseClassId, examId: number) =>
  licenseClass === 'B' ? String(examId) : `${licenseClass}-${examId}`;

/** Grades answers. Without `passCount` (practice) the pass mark is 90%. */
export const gradeExam = (questions: Question[], picked: Record<number, number>, passCount?: number): ExamResult => {
  const correct = questions.filter((q) => picked[q.id] === q.answer).length;
  const criticalFailed = questions.some((q) => q.isCritical && picked[q.id] !== q.answer);
  const needed = passCount ?? Math.ceil(questions.length * PRACTICE_PASS_RATIO - 1e-9);
  return {
    total: questions.length,
    correct,
    passCount: needed,
    criticalFailed,
    passed: !criticalFailed && correct >= needed,
  };
};
