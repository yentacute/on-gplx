import { useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { useQuestions } from '@/api/queries';
import { MenuCard } from '@/components/MenuCard';
import { TOPIC_META } from '@/data/topics';

const TopicsScreen = () => {
  const router = useRouter();
  const { data: questions } = useQuestions();

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerClassName="gap-3 p-3">
      <Text className="text-sm font-semibold uppercase tracking-wide text-slate-500">Chọn danh mục</Text>
      {TOPIC_META.map((topic) => {
        const count = questions?.filter((q) => q.category === topic.id).length;
        return (
          <MenuCard
            key={topic.id}
            title={topic.title}
            description={`${topic.chapter} · ${topic.range}`}
            icon={topic.icon}
            color={topic.color}
            badge={count !== undefined ? `${count} câu` : undefined}
            onPress={() => router.push({ pathname: '/quiz', params: { mode: 'practice', category: topic.id } })}
          />
        );
      })}
    </ScrollView>
  );
};

export default TopicsScreen;
