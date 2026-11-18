import { View } from 'react-native';
import {
  ActionLink,
  Card,
  ContentPage,
  PageHeading,
  Paragraph,
} from '@/components/seo/ContentPage';
import { QuestionAnswerRow } from '@/components/seo/QuestionAnswerRow';
import { CRITICAL_QUESTIONS } from '@/seo/catalog';
import { routeMetadata } from '@/seo/pages';
import { paths } from '@/seo/slugs';
import { itemListJsonLd } from '@/seo/structuredData';

const CriticalQuestionsPage = () => (
  <>
    <ContentPage
      trail={[{ name: 'Câu điểm liệt', path: paths.critical }]}
      jsonLd={[
        itemListJsonLd(
          `${CRITICAL_QUESTIONS.length} câu điểm liệt`,
          CRITICAL_QUESTIONS.map((q) => ({ name: `Câu ${q.id}`, path: paths.question(q) })),
        ),
      ]}
    >
      <Card>
        <PageHeading>{CRITICAL_QUESTIONS.length} câu điểm liệt thi lý thuyết lái xe ô tô có đáp án</PageHeading>
        <Paragraph>
          Câu điểm liệt là những câu hỏi về tình huống mất an toàn giao thông nghiêm trọng. Bộ 600 câu lý thuyết có{' '}
          {CRITICAL_QUESTIONS.length} câu điểm liệt, mỗi đề thi có ít nhất một câu. Trả lời sai một câu điểm liệt là
          trượt bài thi lý thuyết, dù tổng số câu đúng vẫn đủ điểm đạt.
        </Paragraph>
        <Paragraph>
          Mẹo: phần lớn câu điểm liệt hỏi về hành vi bị nghiêm cấm (uống rượu bia khi lái xe, chạy quá tốc độ, đi
          ngược chiều), nhường đường cho xe ưu tiên và xử lý khi gặp tai nạn. Đáp án đúng thường là phương án cấm
          hoặc phương án an toàn nhất.
        </Paragraph>
        <View className="flex-row gap-3">
          <ActionLink href={{ pathname: '/quiz', params: { mode: 'critical' } }} label="Luyện câu điểm liệt" primary />
          <ActionLink href="/tips" label="Mẹo ghi nhớ" />
        </View>
      </Card>
      <Card>
        {CRITICAL_QUESTIONS.map((q) => (
          <QuestionAnswerRow key={q.id} question={q} />
        ))}
      </Card>
    </ContentPage>
  </>
);

export const generateMetadata = routeMetadata(paths.critical);

export default CriticalQuestionsPage;
