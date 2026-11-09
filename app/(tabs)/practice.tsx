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
      <Text className="text-sm font-semibold uppercase tracking-wide text-slate-500">Chọn chế độ ôn tập</Text>
      <MenuCard
        title="Ôn tập toàn bộ câu hỏi"
        description="Làm lần lượt theo thứ tự, xem đáp án ngay"
        icon="library"
        color="#2563eb"
        badge={countLabel(questions?.length)}
        onPress={() => startQuiz('practice')}
      />
      <MenuCard
        title="Câu điểm liệt"
        description="Sai một câu là trượt — cần thuộc lòng"
        icon="alert-circle"
        color="#dc2626"
        badge={countLabel(questions?.filter((q) => q.isCritical).length)}
        onPress={() => startQuiz('critical')}
      />
      <MenuCard
        title="Xem lại câu đã sai"
        description="Luyện lại những câu bạn từng làm sai"
        icon="refresh-circle"
        color="#ea580c"
        badge={countLabel(wrongCount)}
        onPress={() => startQuiz('wrong')}
      />
      <MenuCard
        title="Ôn theo danh mục"
        description="Chọn từng chương: quy tắc, biển báo, sa hình…"
        icon="layers"
        color="#0891b2"
        badge={`${TOPIC_META.length} danh mục`}
        onPress={() => router.push('/topics')}
      />
      <MenuCard
        title="Mẹo ghi nhớ"
        description="Mẹo nhớ nhanh theo nhóm, không cần học vẹt"
        icon="bulb"
        color="#d97706"
        badge={`${TIP_SECTIONS.length} nhóm`}
        onPress={() => router.push('/tips')}
      />
    </ScrollView>
  );
};

export default PracticeScreen;
