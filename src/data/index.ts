import type { Exam, Question, RawQuestion, Topic, TrafficSign } from '@/types';
import examsJson from './exams.json';
import questionsJson from './questions.json';
import signsJson from './signs.json';

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;

const topicForCategory = (category: string): Topic => {
  if (category.startsWith('Chương I.')) return 'rules';
  if (category.startsWith('Chương II.')) return 'culture';
  if (category.startsWith('Chương III.') || category.startsWith('Chương IV.')) return 'technique';
  if (category.startsWith('Chương V.')) return 'signs';
  if (category.startsWith('Chương VI.')) return 'situations';
  throw new Error(`Không thể xác định chủ đề cho danh mục: ${category}`);
};

const toQuestion = (raw: RawQuestion): Question => {
  const options = OPTION_KEYS.flatMap((key) => {
    const value = raw.options[key];
    return value === undefined ? [] : [{ key, value }];
  });
  const answer = options.findIndex(({ key }) => key === raw.correctAnswer);
  if (answer === -1) {
    throw new Error(`Đáp án ${raw.correctAnswer} không tồn tại ở câu ${raw.questionNumber}`);
  }
  return {
    id: raw.id,
    text: raw.question,
    options: options.map(({ value }) => value),
    answer,
    hint: raw.explanation,
    isCritical: raw.isPointDeduction === true,
    category: raw.category,
    topic: topicForCategory(raw.category),
    licenseTypes: raw.licenseTypes,
    images: raw.hasImage ? [`q${raw.questionNumber}.jpg`] : undefined,
  };
};

/** The full 600-question bank. */
export const QUESTIONS: Question[] = (questionsJson as RawQuestion[]).map(toQuestion);

/** 20 fixed exams of 30 questions each (class B structure), no overlap. */
export const EXAMS: Exam[] = examsJson;

export const SIGNS = signsJson as TrafficSign[];

/** Questions used for one license class. */
export const questionsForClass = (licenseClass: string) =>
  QUESTIONS.filter((q) => q.licenseTypes.includes(licenseClass));

/** False for classes whose question set is not in the bundled data yet (motorbike classes for now). */
export const classHasQuestions = (licenseClass: string) => QUESTIONS.some((q) => q.licenseTypes.includes(licenseClass));
