import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { correctAnswer } from '@/seo/catalog';
import { paths } from '@/seo/slugs';
import type { Question } from '@/types';

/** One question with its correct answer, linking to the question's own page. */
export const QuestionAnswerRow = ({ question }: { question: Question }) => (
  <View className="gap-1 border-b border-slate-100 py-2.5">
    <Link href={paths.question(question)} className="text-sm font-semibold leading-6 text-slate-900">
      Câu {question.id}: {question.text}
    </Link>
    <Text className="text-sm leading-6 text-green-800">Đáp án: {correctAnswer(question)}</Text>
    {question.isCritical ? <Text className="text-xs font-semibold text-danger">Câu điểm liệt</Text> : null}
  </View>
);
