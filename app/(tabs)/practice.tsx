import { useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { useQuestions } from '@/api/queries';
import { MenuCard } from '@/components/MenuCard';
import { TIP_SECTIONS } from '@/data/tips';
import { TOPIC_META } from '@/data/topics';
import { useSettings } from '@/store/settings';
import type { QuizMode } from '@/types';

const countLabel = (count?: number) => (count === undefined ? undefined : `${count} câu`);

const PracticeScreen = () => {
  const router = useRouter();
  const { data: questions } = useQuestions();
  const wrongCount = useSettings((s) => s.wrongIds.length);
  const startQuiz = (mode: QuizMode) => router.push({ pathname: '/quiz', params: { mode } });

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-3 p-3">
      <Text className="text-sm font-semibold uppercase tracking-wide text-slate-500">Chế độ ôn tập</Text>
      <MenuCard
        title="Tất cả câu hỏi"
        description="Làm theo thứ tự, có đáp án"
        icon="library"
        color="#2563eb"
        badge={countLabel(questions?.length)}
        onPress={() => startQuiz('practice')}
      />
      <MenuCard
        title="Câu điểm liệt"
        description="Sai 1 câu là trượt"
        icon="alert-circle"
        color="#dc2626"
        badge={countLabel(questions?.filter((q) => q.isCritical).length)}
        onPress={() => startQuiz('critical')}
      />
      <MenuCard
        title="Câu đã sai"
        description="Làm lại các câu từng sai"
        icon="refresh-circle"
        color="#ea580c"
        badge={countLabel(wrongCount)}
        onPress={() => startQuiz('wrong')}
      />
      <MenuCard
        title="Theo chương"
        description="Luật, biển báo, sa hình"
        icon="layers"
        color="#0891b2"
        badge={`${TOPIC_META.length} chương`}
        onPress={() => router.push('/topics')}
      />
      <MenuCard
        title="Mẹo ghi nhớ"
        description="Nhớ nhanh theo nhóm"
        icon="bulb"
        color="#d97706"
        badge={`${TIP_SECTIONS.length} nhóm`}
        onPress={() => router.push('/tips')}
      />
    </ScrollView>
  );
};

export default PracticeScreen;
