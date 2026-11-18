import { classById } from './data';
import type { LicenseClass } from './types';

export type FaqItem = { question: string; answer: string };

const b = classById('B')!.exam;
const c = classById('C')!.exam;

/** Same questions as the Expo site's home FAQ, so the FAQPage rich result keeps working. */
export const HOME_FAQ: FaqItem[] = [
  {
    question: 'Thi lý thuyết bằng lái xe ô tô hạng B có bao nhiêu câu?',
    answer: `Đề thi lý thuyết hạng B có ${b.questionCount} câu, làm trong ${b.timeMinutes} phút, cần đúng tối thiểu ${b.passingScore}/${b.questionCount} câu và không sai câu điểm liệt.`,
  },
  {
    question: 'Câu điểm liệt là gì?',
    answer:
      'Câu điểm liệt là câu hỏi về tình huống mất an toàn giao thông nghiêm trọng. Trong bộ 600 câu có 60 câu điểm liệt. Làm sai một câu điểm liệt là trượt bài thi lý thuyết, dù tổng số câu đúng vẫn đủ điểm.',
  },
  {
    question: 'Bộ đề lý thuyết lái xe ô tô hiện nay có bao nhiêu câu?',
    answer:
      'Bộ đề dùng để ôn và sát hạch lý thuyết các hạng ô tô gồm 600 câu, chia theo 6 chương: quy định chung và quy tắc giao thông, văn hóa giao thông, kỹ thuật lái xe, cấu tạo và sửa chữa, báo hiệu đường bộ, sa hình.',
  },
  {
    question: 'Thi lý thuyết bằng C, D khác bằng B thế nào?',
    answer: `Các hạng xe lớn có đề dài hơn: hạng C ${c.questionCount} câu trong ${c.timeMinutes} phút, cần đúng ${c.passingScore} câu; các hạng D và hạng kéo rơ-moóc 45 câu trong 26 phút, cần đúng 41 câu.`,
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

export const classFaq = (k: LicenseClass): FaqItem[] => [
  {
    question: `Thi lý thuyết bằng lái hạng ${k.id} có bao nhiêu câu?`,
    answer: `Bài thi lý thuyết hạng ${k.id} có ${k.exam.questionCount} câu, làm trong ${k.exam.timeMinutes} phút. Đề được lấy ngẫu nhiên từ bộ 600 câu hỏi, trong đó có ít nhất một câu điểm liệt.`,
  },
  {
    question: `Hạng ${k.id} cần đúng bao nhiêu câu để đỗ?`,
    answer: `Cần trả lời đúng tối thiểu ${k.exam.passingScore}/${k.exam.questionCount} câu và không sai câu điểm liệt nào. Sai một câu điểm liệt là trượt, dù tổng số câu đúng vẫn đủ.`,
  },
  {
    question: `Bao nhiêu tuổi thì được thi bằng lái hạng ${k.id}?`,
    answer: `Người học phải đủ ${k.minAge} tuổi trở lên. Hạng ${k.id} dùng cho ${k.title.toLowerCase()} (${k.description}).`,
  },
];

export const faqLd = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
});

export const courseLd = (name: string, description: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name,
  description,
  url,
  inLanguage: 'vi-VN',
  isAccessibleForFree: true,
  provider: { '@type': 'Organization', name: 'Ôn thi GPLX', url: 'https://ontaplaixe.com' },
});
