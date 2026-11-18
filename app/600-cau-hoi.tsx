import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import {
  ActionLink,
  Card,
  ContentPage,
  LinkChips,
  PageHeading,
  Paragraph,
  SectionHeading,
} from '@/components/seo/ContentPage';
import { QUESTIONS } from '@/data';
import { TOPIC_META } from '@/data/topics';
import { CRITICAL_QUESTIONS, LANDING_CLASSES, questionsInChapter } from '@/seo/catalog';
import { routeMetadata } from '@/seo/pages';
import { paths } from '@/seo/slugs';

const AllQuestionsPage = () => (
  <>
    <ContentPage trail={[{ name: '600 câu hỏi', path: paths.allQuestions }]}>
      <Card>
        <PageHeading>{QUESTIONS.length} câu hỏi lý thuyết lái xe ô tô có đáp án</PageHeading>
        <Paragraph>
          Bộ {QUESTIONS.length} câu hỏi dùng để ôn và sát hạch lý thuyết giấy phép lái xe ô tô các hạng B, C1, C, D1,
          D2, D và hạng kéo rơ-moóc, gồm {CRITICAL_QUESTIONS.length} câu điểm liệt. Câu hỏi chia thành{' '}
          {TOPIC_META.length} chương. Chọn một chương để xem đáp án, hoặc mở từng câu để xem giải thích.
        </Paragraph>
        <View className="flex-row gap-3">
          <ActionLink href={paths.critical} label={`${CRITICAL_QUESTIONS.length} câu điểm liệt`} primary />
          <ActionLink href="/exam" label="Thi thử" />
        </View>
        <Text className="text-xs text-slate-500">Thi thử theo hạng:</Text>
        <LinkChips links={LANDING_CLASSES.map((c) => ({ name: `Hạng ${c.id}`, path: paths.licenseClass(c.id) }))} />
      </Card>

      {TOPIC_META.map((t) => {
        const questions = questionsInChapter(t);
        return (
          <Card key={t.id}>
            <SectionHeading>
              {t.chapter}: {t.title}
            </SectionHeading>
            <Text className="text-xs text-slate-500">
              {t.range} · {questions.length} câu ·{' '}
              <Link href={paths.chapter(t.id)} className="font-medium text-primary">
                Xem đáp án cả chương
              </Link>
            </Text>
            {questions.map((q) => (
              <Link key={q.id} href={paths.question(q)} className="py-1 text-sm leading-6 text-slate-700">
                <Text className="font-semibold text-slate-900">Câu {q.id}.</Text> {q.text}
              </Link>
            ))}
          </Card>
        );
      })}
    </ContentPage>
  </>
);

export const generateMetadata = routeMetadata(paths.allQuestions);

export default AllQuestionsPage;
