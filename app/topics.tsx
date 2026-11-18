import { useRouter } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { useQuestions } from '@/api/queries';
import { MenuCard } from '@/components/MenuCard';
import { NavList } from '@/components/seo/ContentPage';
import { WebOnly } from '@/components/seo/WebOnly';
import { TOPIC_META } from '@/data/topics';
import { routeMetadata } from '@/seo/pages';
import { paths } from '@/seo/slugs';

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
      <WebOnly>
        <Text className="mt-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Xem đáp án theo chương</Text>
        <NavList
          items={[
            ...TOPIC_META.map((t) => ({ title: t.title, subtitle: `${t.chapter} · Xem đáp án`, path: paths.chapter(t.id) })),
            { title: '60 câu điểm liệt', subtitle: 'Danh sách có đáp án', path: paths.critical },
          ]}
        />
      </WebOnly>
    </ScrollView>
  );
};

export const generateMetadata = routeMetadata('/topics');

export default TopicsScreen;
