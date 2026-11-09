import type { Question } from '@/types';

export const getHint = (question: Question) => {
  const memo = question.hint ?? question.explanation ?? '';
  return { clue: memo ? [memo] : [], memo };
};
