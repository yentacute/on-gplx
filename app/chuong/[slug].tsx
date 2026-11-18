import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import {
  ActionLink,
  Card,
  ContentPage,
  NavList,
  SectionHeading,
  PageHeading,
  Paragraph,
} from '@/components/seo/ContentPage';
import { QuestionAnswerList } from '@/components/seo/QuestionAnswerRow';
import { TOPIC_META } from '@/data/topics';
import { chapterBySlug, chapterName, questionsInChapter } from '@/seo/catalog';
import { dynamicRouteMetadata } from '@/seo/pages';
import { chapterSlug, paths } from '@/seo/slugs';
import { itemListJsonLd } from '@/seo/structuredData';

const ChapterPage = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const chapter = chapterBySlug(slug);
  if (!chapter) return <Text className="p-4 text-center text-slate-600">Không tìm thấy chương.</Text>;

  const questions = questionsInChapter(chapter);
  const path = paths.chapter(chapter.id);
  const name = chapterName(chapter.id);
  const critical = questions.filter((q) => q.isCritical).length;

  return (
    <>
      <ContentPage
        trail={[
          { name: '600 câu hỏi', path: paths.allQuestions },
          { name: chapter.chapter, path },
        ]}
        jsonLd={[
          itemListJsonLd(
            `${chapter.chapter}. ${name}`,
            questions.map((q) => ({ name: `Câu ${q.id}`, path: paths.question(q) })),
          ),
        ]}
      >
        <Card>
          <PageHeading>
            {chapter.chapter}: {name}
          </PageHeading>
          <Paragraph>
            {chapter.chapter} gồm {questions.length} câu ({chapter.range}) trong bộ 600 câu hỏi lý thuyết lái xe ô
            tô{critical > 0 ? `, trong đó có ${critical} câu điểm liệt` : ''}. Dưới đây là toàn bộ câu hỏi kèm đáp
            án đúng. Chọn một câu để xem các phương án và lời giải thích.
          </Paragraph>
          <View className="flex-row gap-3">
            <ActionLink
              href={{ pathname: '/quiz', params: { mode: 'practice', category: chapter.id } }}
              label="Luyện chương này"
              primary
            />
            <ActionLink href="/exam" label="Thi thử" />
          </View>
        </Card>

        <QuestionAnswerList questions={questions} />

        <SectionHeading>Các chương khác</SectionHeading>
        <NavList
          items={TOPIC_META.filter((t) => t.id !== chapter.id).map((t) => ({
            title: t.title,
            subtitle: `${t.chapter} · ${t.range}`,
            path: paths.chapter(t.id),
          }))}
        />
      </ContentPage>
    </>
  );
};

export const generateStaticParams = () => TOPIC_META.map((t) => ({ slug: chapterSlug(t.id) }));

export const generateMetadata = dynamicRouteMetadata((slug) => `/chuong/${slug}`, 'slug');

export default ChapterPage;
