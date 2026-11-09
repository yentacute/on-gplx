import type { Exam, Question, RawQuestion, Topic, TrafficSign } from '@/types';
import examsJson from './exams.json';
import questionsJson from './questions.json';
import signsJson from './signs.json';

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;

const topicForCategory = (category: string): Topic => {
  if (category.startsWith('Chương I.')) return 'rules';
  if (category.startsWith('Chương II.')) return 'culture';
  if (category.startsWith('Chương III.') || category.startsWith('Chương IV.')) return 'technique';
  if (category.startsWith('Chương V.')) return 'signs';
  if (category.startsWith('Chương VI.')) return 'situations';
  throw new Error(`Không thể xác định chủ đề cho danh mục: ${category}`);
};

const toQuestion = (raw: RawQuestion): Question => {
  const options = OPTION_KEYS.flatMap((key) => {
    const value = raw.options[key];
    return value === undefined ? [] : [{ key, value }];
  });
  const answer = options.findIndex(({ key }) => key === raw.correctAnswer);
  if (answer === -1) {
    throw new Error(`Đáp án ${raw.correctAnswer} không tồn tại ở câu ${raw.questionNumber}`);
  }
  return {
    id: raw.id,
    text: raw.question,
    options: options.map(({ value }) => value),
    answer,
    hint: raw.explanation,
    isCritical: raw.isPointDeduction === true,
    category: raw.category,
    topic: topicForCategory(raw.category),
    images: raw.hasImage ? [`q${raw.questionNumber}.jpg`] : undefined,
  };
};

/** The full 600-question bank. */
export const QUESTIONS: Question[] = (questionsJson as RawQuestion[]).map(toQuestion);

/** 20 fixed exams of 30 questions each, no overlap. */
export const EXAMS: Exam[] = examsJson;

export const SIGNS = signsJson as TrafficSign[];

/** Small hand-written set kept from the first version of the app. */
export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'Chương I. Quy định chung và quy tắc giao thông đường bộ',
    topic: 'rules',
    isCritical: true,
    text: 'Người điều khiển phương tiện đã uống rượu, bia có được lái xe không?',
    options: [
      'Được, nếu uống ít',
      'Không được, nghiêm cấm lái xe khi trong cơ thể có nồng độ cồn',
      'Được, nếu đi quãng đường ngắn',
    ],
    answer: 1,
    explanation: 'Pháp luật nghiêm cấm điều khiển phương tiện khi trong cơ thể có nồng độ cồn.',
  },
  {
    id: 2,
    category: 'Chương V. Báo hiệu đường bộ',
    topic: 'signs',
    isCritical: false,
    text: 'Biển báo hình tròn, viền đỏ, nền trắng thuộc nhóm biển nào?',
    options: ['Biển báo nguy hiểm', 'Biển báo cấm', 'Biển chỉ dẫn', 'Biển phụ'],
    answer: 1,
    explanation: 'Biển hình tròn viền đỏ nền trắng thường là biển báo cấm.',
  },
  {
    id: 3,
    category: 'Chương I. Quy định chung và quy tắc giao thông đường bộ',
    topic: 'rules',
    isCritical: true,
    text: 'Khi gặp đèn tín hiệu giao thông màu đỏ, người điều khiển phương tiện phải làm gì?',
    options: [
      'Được phép đi tiếp nếu không có xe khác',
      'Phải dừng lại trước vạch dừng',
      'Giảm tốc độ và đi qua nhanh',
    ],
    answer: 1,
    explanation: 'Đèn đỏ: phải dừng lại trước vạch dừng.',
  },
  {
    id: 4,
    category: 'Chương III. Kỹ thuật lái xe',
    topic: 'technique',
    isCritical: false,
    text: 'Khi điều khiển ô tô, người lái xe và người ngồi hàng ghế trước phải làm gì để đảm bảo an toàn?',
    options: ['Thắt dây an toàn', 'Mở cửa kính', 'Bật đèn trong xe'],
    answer: 0,
    explanation: 'Phải thắt dây an toàn khi xe đang chạy.',
  },
  {
    id: 5,
    category:
      'Chương II. Văn hóa giao thông, đạo đức người lái xe, kỹ năng phòng cháy, chữa cháy và cứu hộ, cứu nạn',
    topic: 'culture',
    isCritical: false,
    text: 'Văn hóa giao thông thể hiện qua hành vi nào sau đây?',
    options: [
      'Nhường đường cho người đi bộ qua đường',
      'Bấm còi liên tục trong khu dân cư',
      'Lấn làn để đi nhanh hơn',
    ],
    answer: 0,
  },
];
