import type { LicenseClassId, Question, TrafficSign } from '@/types';

/** Lowercase ASCII slug: "Biển báo P.103a" → "bien-bao-p-103a". */
export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Short, readable URL slugs for the six chapters of the question bank, keyed by Roman numeral. */
const CHAPTER_SLUGS: Record<string, string> = {
  I: 'khai-niem-va-quy-tac-giao-thong',
  II: 'van-hoa-giao-thong-dao-duc-nguoi-lai-xe',
  III: 'ky-thuat-lai-xe',
  IV: 'cau-tao-va-sua-chua',
  V: 'bien-bao-duong-bo',
  VI: 'sa-hinh',
};

/** "Chương V. Báo hiệu đường bộ" → "bien-bao-duong-bo". */
export const chapterSlug = (category: string) => {
  const numeral = category.match(/^Chương ([IVX]+)\./)?.[1];
  return (numeral && CHAPTER_SLUGS[numeral]) || slugify(category);
};

/** Classes that get their own landing page: the base car classes. Trailer classes share the same bank. */
export const LANDING_CLASS_IDS: LicenseClassId[] = ['B', 'C1', 'C', 'D1', 'D2', 'D'];

export const paths = {
  question: (q: Pick<Question, 'id'>) => `/cau-hoi/${q.id}`,
  sign: (s: Pick<TrafficSign, 'id'>) => `/bien-bao/${slugify(s.id)}`,
  chapter: (category: string) => `/chuong/${chapterSlug(category)}`,
  licenseClass: (id: string) => `/thi-thu/hang-${id.toLowerCase()}`,
  critical: '/cau-diem-liet',
  allQuestions: '/600-cau-hoi',
} as const;

/** Short header text for each content route, from its route params. */
export const contentHeaderTitle = (routeName: string, params: Record<string, unknown> | undefined) => {
  const param = String(params?.id ?? params?.slug ?? '');
  switch (routeName) {
    case 'cau-hoi/[id]':
      return `Câu ${param}/600`;
    case 'bien-bao/[id]':
      return param.startsWith('vachke') ? 'Vạch kẻ đường' : `Biển ${param.replace(/^([a-z]+)-/, (_, code: string) => `${code.toUpperCase()}.`)}`;
    case 'chuong/[slug]':
      return 'Câu hỏi theo chương';
    case 'thi-thu/[slug]':
      return `Hạng ${param.replace(/^hang-/, '').toUpperCase()}`;
    case 'cau-diem-liet':
      return 'Câu điểm liệt';
    default:
      return '600 câu hỏi';
  }
};
