import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import {
  ActionLink,
  Card,
  ContentPage,
  LinkChips,
  NavList,
  Paragraph,
  SectionHeading,
  Step,
} from '@/components/seo/ContentPage';
import { QUESTIONS } from '@/data';
import { TOPIC_META } from '@/data/topics';
import { CRITICAL_QUESTIONS, LANDING_CLASSES, classBySlug } from '@/seo/catalog';
import { faqStructuredData, type FaqItem } from '@/seo/homeFaq';
import { dynamicRouteMetadata } from '@/seo/pages';
import { paths } from '@/seo/slugs';
import { courseJsonLd } from '@/seo/structuredData';
import { useSettings } from '@/store/settings';
import type { LicenseClass } from '@/types';

const classFaq = (c: LicenseClass): FaqItem[] => [
  {
    question: `Thi lý thuyết bằng lái hạng ${c.id} có bao nhiêu câu?`,
    answer: `Bài thi lý thuyết hạng ${c.id} có ${c.exam.questionCount} câu, làm trong ${c.exam.timeMinutes} phút. Đề được lấy ngẫu nhiên từ bộ 600 câu hỏi, trong đó có ít nhất một câu điểm liệt.`,
  },
  {
    question: `Hạng ${c.id} cần đúng bao nhiêu câu để đỗ?`,
    answer: `Cần trả lời đúng tối thiểu ${c.exam.passingScore}/${c.exam.questionCount} câu và không sai câu điểm liệt nào. Sai một câu điểm liệt là trượt, dù tổng số câu đúng vẫn đủ.`,
  },
  {
    question: `Bao nhiêu tuổi thì được thi bằng lái hạng ${c.id}?`,
    answer: `Người học phải đủ ${c.minAge} tuổi trở lên. Hạng ${c.id} dùng cho ${c.title.toLowerCase()} (${c.description}).`,
  },
];

const Stat = ({ value, label }: { value: string | number; label: string }) => (
  <View className="flex-1 items-center gap-0.5 rounded-xl border border-white/25 bg-white/15 py-2">
    <Text className="text-lg font-bold text-white">{value}</Text>
    <Text className="text-xs text-white/80">{label}</Text>
  </View>
);

const LicenseClassPage = () => {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const setLicenseClass = useSettings((s) => s.setLicenseClass);
  const c = classBySlug(slug);
  if (!c) return <Text className="p-4 text-center text-slate-600">Không tìm thấy hạng bằng.</Text>;

  const path = paths.licenseClass(c.id);
  const faq = classFaq(c);
  const heading = `Thi thử lý thuyết lái xe hạng ${c.id}`;

  const start = (target: '/exam' | '/practice') => {
    setLicenseClass(c.id);
    router.push(target);
  };

  return (
    <>
      <ContentPage
        trail={[
          { name: 'Thi thử', path: '/exam' },
          { name: `Hạng ${c.id}`, path },
        ]}
        jsonLd={[
          courseJsonLd(
            `Ôn thi lý thuyết lái xe hạng ${c.id}`,
            `Ôn 600 câu hỏi và thi thử lý thuyết sát hạch giấy phép lái xe hạng ${c.id}: ${c.exam.questionCount} câu, ${c.exam.timeMinutes} phút, đạt ${c.exam.passingScore} câu.`,
            path,
          ),
          faqStructuredData(faq),
        ]}
      >
        <View className="gap-3 rounded-3xl bg-primary p-4">
          <Text role="heading" aria-level={1} className="text-xl font-bold leading-7 text-white">
            {heading}
          </Text>
          <Text className="text-sm leading-6 text-white/85">
            Giấy phép lái xe hạng {c.id} dành cho {c.title.toLowerCase()} ({c.description}), người học từ {c.minAge}{' '}
            tuổi. Đề thi lấy từ bộ {QUESTIONS.length} câu dùng chung cho các hạng ô tô, có{' '}
            {CRITICAL_QUESTIONS.length} câu điểm liệt.
          </Text>
          <View className="flex-row gap-2">
            <Stat value={c.exam.questionCount} label="câu hỏi" />
            <Stat value={`${c.exam.timeMinutes} phút`} label="thời gian" />
            <Stat value={`${c.exam.passingScore}/${c.exam.questionCount}`} label="điểm đạt" />
          </View>
          <View className="flex-row gap-3">
            <Pressable onPress={() => start('/exam')} accessibilityRole="button" className="flex-1 rounded-xl bg-white px-4 py-3">
              <Text className="text-center text-sm font-semibold text-primary">Thi thử hạng {c.id}</Text>
            </Pressable>
            <Pressable
              onPress={() => start('/practice')}
              accessibilityRole="button"
              className="flex-1 rounded-xl border border-white/40 px-4 py-3"
            >
              <Text className="text-center text-sm font-semibold text-white">Ôn tập hạng {c.id}</Text>
            </Pressable>
          </View>
        </View>

        <Card>
          <SectionHeading>Cách ôn thi lý thuyết hạng {c.id} hiệu quả</SectionHeading>
          <Step n={1}>Học kỹ {CRITICAL_QUESTIONS.length} câu điểm liệt trước, vì sai một câu là trượt cả bài.</Step>
          <Step n={2}>Ôn lần lượt 6 chương của bộ 600 câu, mỗi câu đều có đáp án và giải thích.</Step>
          <Step n={3}>
            Thi thử đề {c.exam.questionCount} câu có hẹn giờ {c.exam.timeMinutes} phút cho đến khi đạt ổn định trên{' '}
            {c.exam.passingScore} câu.
          </Step>
          <Step n={4}>Làm lại các câu đã sai và đọc mẹo ghi nhớ biển báo, sa hình.</Step>
          <View className="flex-row gap-3">
            <ActionLink href={paths.critical} label="60 câu điểm liệt" primary />
            <ActionLink href="/tips" label="Mẹo thi" />
          </View>
        </Card>

        <SectionHeading>Ôn theo chương</SectionHeading>
        <NavList
          items={TOPIC_META.map((t) => ({ title: t.title, subtitle: `${t.chapter} · ${t.range}`, path: paths.chapter(t.id) }))}
        />

        <Card>
          <SectionHeading>Câu hỏi thường gặp về thi hạng {c.id}</SectionHeading>
          {faq.map(({ question, answer }) => (
            <View key={question} className="gap-1 py-1">
              <Text role="heading" aria-level={3} className="text-[15px] font-semibold text-slate-900">
                {question}
              </Text>
              <Paragraph>{answer}</Paragraph>
            </View>
          ))}
        </Card>

        <Card>
          <Text className="text-xs text-slate-500">Thi thử các hạng khác:</Text>
          <LinkChips
            links={LANDING_CLASSES.filter((o) => o.id !== c.id).map((o) => ({
              name: `Hạng ${o.id}`,
              path: paths.licenseClass(o.id),
            }))}
          />
        </Card>
      </ContentPage>
    </>
  );
};

export const generateStaticParams = () => LANDING_CLASSES.map((c) => ({ slug: `hang-${c.id.toLowerCase()}` }));

export const generateMetadata = dynamicRouteMetadata((slug) => `/thi-thu/${slug}`, 'slug');

export default LicenseClassPage;
