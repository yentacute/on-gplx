import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import {
  ActionLink,
  Card,
  ContentPage,
  LinkChips,
  PageHeading,
  SectionHeading,
} from '@/components/seo/ContentPage';
import { CriticalNotice } from '@/components/CriticalNotice';
import { SeoImage } from '@/components/seo/SeoImage';
import { QUESTIONS } from '@/data';
import { QUESTION_IMAGES } from '@/data/questionImages';
import {
  LANDING_CLASSES,
  chapterName,
  chapterOf,
  neighbours,
  questionById,
  questionImageUri,
} from '@/seo/catalog';
import { dynamicRouteMetadata } from '@/seo/pages';
import { paths } from '@/seo/slugs';
import { questionJsonLd } from '@/seo/structuredData';
import type { Question } from '@/types';

const OptionRow = ({ text, index, correct }: { text: string; index: number; correct: boolean }) => (
  <View
    className={'flex-row items-start gap-2 rounded-xl border px-3 py-2.5 ' + (correct ? 'border-success bg-green-50' : 'border-slate-200 bg-white')}
  >
    <Text className={'flex-1 text-sm font-medium leading-[22px] ' + (correct ? 'text-green-800' : 'text-slate-800')}>
      <Text className="font-semibold">{index + 1}. </Text>
      {text}
    </Text>
    {correct ? <Ionicons name="checkmark-circle" size={20} color="#16a34a" /> : null}
  </View>
);

const QuestionImages = ({ question }: { question: Question }) => (
  <>
    {(question.images ?? []).map((key) => {
      const image = QUESTION_IMAGES[key];
      if (!image) return null;
      return (
        <SeoImage
          key={key}
          source={image.source}
          aspectRatio={image.aspectRatio}
          maxHeight={300}
          alt={`Hình minh họa câu ${question.id}: ${question.text}`}
        />
      );
    })}
  </>
);

const QuestionPage = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const question = questionById(id);
  if (!question) return <Text className="p-4 text-center text-slate-600">Không tìm thấy câu hỏi.</Text>;

  const chapter = chapterOf(question);
  const { prev, next } = neighbours(question);
  const path = paths.question(question);
  const correct = question.options[question.answer] ?? '';

  return (
    <>
      <ContentPage
        trail={[
          { name: '600 câu hỏi', path: paths.allQuestions },
          ...(chapter ? [{ name: chapter.chapter, path: paths.chapter(chapter.id) }] : []),
          { name: `Câu ${question.id}`, path },
        ]}
        jsonLd={[questionJsonLd(question, path, questionImageUri(question))]}
      >
        <Card>
          <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Câu {question.id} · {chapter?.chapter ?? ''}
          </Text>
          {question.isCritical ? <CriticalNotice /> : null}
          <PageHeading>{question.text}</PageHeading>
          <QuestionImages question={question} />
          <View className="gap-2">
            {question.options.map((option, i) => (
              <OptionRow key={i} text={option} index={i} correct={i === question.answer} />
            ))}
          </View>
        </Card>

        <View className="gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="bulb" size={18} color="#d97706" />
            <Text role="heading" aria-level={2} className="text-base font-semibold text-amber-900">
              Đáp án và giải thích
            </Text>
          </View>
          <Text className="text-sm leading-6 text-amber-900">
            Đáp án đúng là <Text className="font-semibold text-green-800">{question.answer + 1}. {correct}</Text>
          </Text>
          {question.hint ? <Text className="text-sm leading-6 text-amber-900">{question.hint}</Text> : null}
          {question.isCritical ? (
            <Text className="text-sm leading-6 text-danger">
              Đây là câu điểm liệt: trả lời sai câu này trong bài thi là trượt lý thuyết dù đủ số câu đúng.
            </Text>
          ) : null}
        </View>

        <View className="flex-row gap-3">
          {prev ? <ActionLink href={paths.question(prev)} label={`← Câu ${prev.id}`} /> : null}
          {next ? <ActionLink href={paths.question(next)} label={`Câu ${next.id} →`} primary /> : null}
        </View>

        <Card>
          <SectionHeading>Ôn tiếp</SectionHeading>
          {chapter ? (
            <Text className="text-sm leading-6 text-slate-700">
              Câu này thuộc{' '}
              <Link href={paths.chapter(chapter.id)} className="font-medium text-primary">
                {chapter.chapter}: {chapterName(chapter.id)}
              </Link>{' '}
              ({chapter.range}) trong bộ 600 câu lý thuyết lái xe ô tô.
            </Text>
          ) : null}
          <View className="flex-row gap-3">
            <ActionLink
              href={{ pathname: '/quiz', params: { mode: 'practice', category: question.category } }}
              label="Luyện chương này"
              primary
            />
            <ActionLink href="/exam" label="Thi thử" />
          </View>
          <Text className="text-xs text-slate-500">Dùng cho các hạng:</Text>
          <LinkChips
            links={LANDING_CLASSES.filter((c) => question.licenseTypes.includes(c.id)).map((c) => ({
              name: `Hạng ${c.id}`,
              path: paths.licenseClass(c.id),
            }))}
          />
        </Card>
      </ContentPage>
    </>
  );
};

export const generateStaticParams = () => QUESTIONS.map((q) => ({ id: String(q.id) }));

export const generateMetadata = dynamicRouteMetadata((id) => `/cau-hoi/${id}`, 'id');

export default QuestionPage;
