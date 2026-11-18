import { LICENSE_CLASSES } from '@/data/licenseClasses';

export type FaqItem = { question: string; answer: string };

const examOf = (id: string) => LICENSE_CLASSES.find((c) => c.id === id)?.exam;

const classB = examOf('B');
const classC = examOf('C');

/** Common questions about the theory test. Shown on the home page and sent to Google as FAQPage data. */
export const HOME_FAQ: FaqItem[] = [
  {
    question: 'Thi lý thuyết bằng lái xe ô tô hạng B có bao nhiêu câu?',
    answer: classB
      ? `Đề thi lý thuyết hạng B có ${classB.questionCount} câu, làm trong ${classB.timeMinutes} phút, cần đúng tối thiểu ${classB.passingScore}/${classB.questionCount} câu và không sai câu điểm liệt.`
      : 'Xem số câu, thời gian và điểm đạt của từng hạng ở bảng hạng bằng trên trang chủ.',
  },
  {
    question: 'Câu điểm liệt là gì?',
    answer:
      'Câu điểm liệt là câu hỏi về tình huống mất an toàn giao thông nghiêm trọng. Trong bộ 600 câu có 60 câu điểm liệt. Làm sai một câu điểm liệt là trượt bài thi lý thuyết, dù tổng số câu đúng vẫn đủ điểm.',
  },
  {
    question: 'Bộ đề lý thuyết lái xe ô tô hiện nay có bao nhiêu câu?',
    answer:
      'Bộ đề dùng để ôn và sát hạch lý thuyết các hạng ô tô gồm 600 câu, chia theo chương: khái niệm và quy tắc giao thông, nghiệp vụ vận tải, văn hóa giao thông, kỹ thuật lái xe, cấu tạo và sửa chữa, biển báo đường bộ, sa hình.',
  },
  {
    question: 'Thi lý thuyết bằng C, D khác bằng B thế nào?',
    answer: classC
      ? `Các hạng xe lớn có đề dài hơn: hạng C ${classC.questionCount} câu trong ${classC.timeMinutes} phút, cần đúng ${classC.passingScore} câu; các hạng D và hạng kéo rơ-moóc 45 câu trong 26 phút, cần đúng 41 câu.`
      : 'Các hạng xe lớn có đề dài hơn và điểm đạt cao hơn hạng B.',
  },
  {
    question: 'Ôn thi GPLX trên ontaplaixe.com có mất phí không?',
    answer:
      'Hoàn toàn miễn phí và không cần đăng ký. Bạn có thể ôn 600 câu, thi thử có chấm điểm, tra biển báo và đọc mẹo ngay trên trình duyệt điện thoại hoặc máy tính.',
  },
  {
    question: 'Làm sao để thi lý thuyết lái xe đạt điểm cao?',
    answer:
      'Ôn hết 60 câu điểm liệt trước, sau đó ôn theo từng chương, làm lại các câu đã sai và thi thử nhiều lần với đề có hẹn giờ cho đến khi đạt ổn định. Mẹo ghi nhớ biển báo và sa hình giúp rút ngắn thời gian ôn.',
  },
];

export const faqStructuredData = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
});
