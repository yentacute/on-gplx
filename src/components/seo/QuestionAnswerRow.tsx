import { Ionicons } from '@expo/vector-icons';
import { type Href, Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { correctAnswer } from '@/seo/catalog';
import { paths } from '@/seo/slugs';
import type { Question } from '@/types';

/** One question with its correct answer; the whole row links to the question's own page. */
export const QuestionAnswerRow = ({ question, first }: { question: Question; first: boolean }) => (
  <Link href={paths.question(question) as Href} asChild>
    <Pressable
      style={({ pressed }) => ({ backgroundColor: pressed ? '#f8fafc' : '#ffffff' })}
      className={'flex-row gap-3 px-4 py-3 ' + (first ? '' : 'border-t border-slate-100')}
    >
      <View className="h-8 min-w-8 items-center justify-center rounded-lg bg-slate-100 px-1.5">
        <Text className="text-xs font-bold text-slate-600">{question.id}</Text>
      </View>
      <View className="flex-1 gap-1.5">
        <Text className="text-[15px] font-semibold leading-[22px] text-slate-900">{question.text}</Text>
        <View className="flex-row items-start gap-1.5">
          <Ionicons name="checkmark-circle" size={16} color="#16a34a" style={{ marginTop: 3 }} />
          <Text className="flex-1 text-sm font-medium leading-[22px] text-green-800">{correctAnswer(question)}</Text>
        </View>
        {question.isCritical ? (
          <View className="flex-row items-center gap-1 self-start rounded-full bg-red-50 px-2 py-0.5">
            <Ionicons name="warning" size={12} color="#dc2626" />
            <Text className="text-xs font-semibold text-danger">Câu điểm liệt</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  </Link>
);

/** Card holding a list of QuestionAnswerRow. */
export const QuestionAnswerList = ({ questions }: { questions: Question[] }) => (
  <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    {questions.map((q, i) => (
      <QuestionAnswerRow key={q.id} question={q} first={i === 0} />
    ))}
  </View>
);
