// Build-time access to the question bank shared with the mobile app. scripts/sync-assets.mjs copies
// ../src/data into src/shared-data before every dev and build run.
import questionsJson from '../shared-data/questions.json';
import signsJson from '../shared-data/signs.json';
import classesJson from '../shared-data/licenseClasses.json';
import examsJson from '../shared-data/exams.json';
import tipsJson from '../shared-data/tips.json';
import type { LicenseClass, Question, Sign, SignGroup, TipSection } from './types';

type RawQuestion = {
  id: number;
  category: string;
  licenseTypes: string[];
  isPointDeduction: boolean;
  question: string;
  hasImage: boolean;
  options: Partial<Record<'a' | 'b' | 'c' | 'd', string>>;
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
};

const OPTION_KEYS = ['a', 'b', 'c', 'd'] as const;

const toQuestion = (raw: RawQuestion): Question => {
  const keys = OPTION_KEYS.filter((key) => raw.options[key] !== undefined);
  return {
    id: raw.id,
    text: raw.question,
    options: keys.map((key) => raw.options[key] ?? ''),
    answer: keys.indexOf(raw.correctAnswer),
    hint: raw.explanation,
    critical: raw.isPointDeduction === true,
    chapter: raw.category,
    classes: raw.licenseTypes,
    image: raw.hasImage ? `/img/q/q${raw.id}.jpg` : undefined,
  };
};

export const QUESTIONS: Question[] = (questionsJson as RawQuestion[]).map(toQuestion);
export const CRITICAL_QUESTIONS = QUESTIONS.filter((q) => q.critical);
export const questionById = (id: number) => QUESTIONS.find((q) => q.id === id);

export const SIGNS: Sign[] = (signsJson as Omit<Sign, 'imageUrl'>[]).map((s) => ({
  ...s,
  imageUrl: s.image ? `/img/signs/${s.image}` : undefined,
}));

export const SIGN_GROUP_LABEL: Record<SignGroup, string> = {
  cam: 'Biển báo cấm',
  nguyhiem: 'Biển báo nguy hiểm',
  hieulenh: 'Biển hiệu lệnh',
  chidan: 'Biển chỉ dẫn',
  phu: 'Biển phụ',
  vachke: 'Vạch kẻ đường',
};
export const SIGN_GROUP_ORDER = Object.keys(SIGN_GROUP_LABEL) as SignGroup[];

export const LICENSE_CLASSES = classesJson as LicenseClass[];
/** Car classes, which the 600-question bank covers. Motorbike classes have no questions yet. */
export const CAR_CLASSES = LICENSE_CLASSES.filter((c) => QUESTIONS.some((q) => q.classes.includes(c.id)));
/** Classes with their own landing page, same set as the Expo site's /thi-thu/hang-x pages. */
export const LANDING_CLASSES = ['B', 'C1', 'C', 'D1', 'D2', 'D'].flatMap((id) => LICENSE_CLASSES.filter((c) => c.id === id));
export const classById = (id: string) => LICENSE_CLASSES.find((c) => c.id === id);

export const TIPS = tipsJson as TipSection[];

// ---- Chapters --------------------------------------------------------------------------------

const CHAPTER_SLUGS: Record<string, string> = {
  I: 'khai-niem-va-quy-tac-giao-thong',
  II: 'van-hoa-giao-thong-dao-duc-nguoi-lai-xe',
  III: 'ky-thuat-lai-xe',
  IV: 'cau-tao-va-sua-chua',
  V: 'bien-bao-duong-bo',
  VI: 'sa-hinh',
};

const CHAPTER_STYLE: Record<string, { icon: string; tone: string }> = {
  I: { icon: 'book', tone: 'sky' },
  II: { icon: 'heart', tone: 'pink' },
  III: { icon: 'wheel', tone: 'cyan' },
  IV: { icon: 'wrench', tone: 'teal' },
  V: { icon: 'sign', tone: 'amber' },
  VI: { icon: 'cross', tone: 'violet' },
};

export type Chapter = {
  id: string;
  numeral: string;
  name: string;
  slug: string;
  icon: string;
  tone: string;
  questionIds: number[];
  range: string;
};

export const CHAPTERS: Chapter[] = [...new Set(QUESTIONS.map((q) => q.chapter))].map((id) => {
  const numeral = id.match(/^Chương ([IVX]+)\./)?.[1] ?? '';
  const ids = QUESTIONS.filter((q) => q.chapter === id).map((q) => q.id);
  return {
    id,
    numeral,
    name: id.replace(/^Chương [IVX]+\.\s*/, ''),
    slug: CHAPTER_SLUGS[numeral] ?? slugify(id),
    questionIds: ids,
    range: `Câu ${ids[0]}–${ids[ids.length - 1]}`,
    ...(CHAPTER_STYLE[numeral] ?? { icon: 'book', tone: 'sky' }),
  };
});
export const chapterOf = (q: Question) => CHAPTERS.find((c) => c.id === q.chapter)!;

// ---- URLs (kept identical to the Expo web build so search rankings carry over) ----------------

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const paths = {
  question: (id: number) => `/cau-hoi/${id}`,
  sign: (s: Pick<Sign, 'id'>) => `/bien-bao/${slugify(s.id)}`,
  chapter: (c: Pick<Chapter, 'slug'>) => `/chuong/${c.slug}`,
  licenseClass: (id: string) => `/thi-thu/hang-${id.toLowerCase()}`,
  exam: (classId: string, examId: number | 'ngau-nhien') =>
    `/thi-thu/hang-${classId.toLowerCase()}/${examId === 'ngau-nhien' ? examId : `de-${examId}`}`,
  practice: (slug: string) => `/on-tap/${slug}`,
  critical: '/cau-diem-liet',
  allQuestions: '/600-cau-hoi',
};

export const signLabel = (s: Sign) => (s.group === 'vachke' ? s.name : `Biển ${s.id} ${s.name}`);

// ---- Exams (same seeded generator as src/lib/exam.ts, so fixed exams match the app) ------------

const seededRandom = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const hashText = (text: string) => [...text].reduce((hash, ch) => Math.imul(hash, 31) + ch.charCodeAt(0), 7);

const shuffle = <T,>(items: readonly T[], random: () => number): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

const CRITICAL_PER_EXAM = 3;
export const FIXED_EXAM_COUNT = 20;

const randomExam = (pool: Question[], size: number, random: () => number) => {
  const critical = shuffle(pool.filter((q) => q.critical), random).slice(0, CRITICAL_PER_EXAM);
  const rest = shuffle(pool.filter((q) => !q.critical), random).slice(0, size - critical.length);
  return shuffle([...critical, ...rest], random).map((q) => q.id);
};

/** The 20 fixed exams of a class. Class B uses the hand-picked set in exams.json, like the app. */
export const fixedExams = (c: LicenseClass): { id: number; questionIds: number[] }[] => {
  const handPicked = examsJson as { id: number; questionIds: number[] }[];
  if (c.id === 'B' && handPicked.every((e) => e.questionIds.length === c.exam.questionCount)) return handPicked;
  const pool = QUESTIONS.filter((q) => q.classes.includes(c.id));
  return Array.from({ length: FIXED_EXAM_COUNT }, (_, index) => ({
    id: index + 1,
    questionIds: randomExam(pool, c.exam.questionCount, seededRandom(hashText(c.id) + index)),
  }));
};

/** Cuts text at a word boundary for titles and meta descriptions. */
export const clip = (text: string, max: number) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, '')}…`;
};
