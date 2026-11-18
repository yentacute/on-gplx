import type { GenerateMetadataFunction, Metadata } from 'expo-server';
import { SIGN_GROUP_LABEL } from '@/data/signGroups';
import {
  CRITICAL_QUESTIONS,
  chapterBySlug,
  chapterName,
  classBySlug,
  clip,
  correctAnswer,
  questionById,
  questionImageUri,
  questionsInChapter,
  signBySlug,
  signImageUri,
  signLabel,
} from './catalog';
import { paths } from './slugs';

/** Public address of the web build. Canonical URLs, Open Graph and the sitemap use it. */
export const SITE_URL = 'https://ontaplaixe.com';
export const SITE_NAME = 'Ôn thi GPLX';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export type PageSeo = {
  title: string;
  description: string;
  /** Kept out of search results: personal or state-dependent screens. */
  noindex?: boolean;
  /** Site-relative image for social previews, when the page has its own picture. */
  image?: string;
};

export const DEFAULT_SEO: PageSeo = {
  title: 'Ôn thi GPLX 2026 – 600 câu lý thuyết lái xe ô tô, thi thử miễn phí',
  description:
    'Ôn thi lý thuyết bằng lái xe ô tô hạng B, C1, C, D1, D2, D: 600 câu hỏi mới nhất, thi thử theo đúng cấu trúc đề, câu điểm liệt, biển báo giao thông và mẹo ghi nhớ. Miễn phí, không cần đăng ký.',
};

/** SEO for each public route, keyed by pathname. */
export const PAGE_SEO: Record<string, PageSeo> = {
  '/': DEFAULT_SEO,
  '/practice': {
    title: 'Ôn tập 600 câu lý thuyết lái xe – câu điểm liệt, câu hay sai',
    description:
      'Luyện 600 câu hỏi lý thuyết GPLX theo hạng bằng, có đáp án và giải thích. Ôn riêng câu điểm liệt, câu đã làm sai và từng chương: khái niệm, quy tắc, văn hóa giao thông, kỹ thuật lái xe, biển báo, sa hình.',
  },
  '/exam': {
    title: 'Thi thử lý thuyết lái xe ô tô – 20 đề có chấm điểm',
    description:
      'Thi thử bằng lái B, C1, C, D theo đúng số câu, thời gian và điểm đạt của từng hạng. 20 đề cố định và đề ngẫu nhiên, có hẹn giờ, chấm điểm và báo trượt khi sai câu điểm liệt.',
  },
  '/signs': {
    title: 'Biển báo giao thông đường bộ Việt Nam – ý nghĩa từng biển',
    description:
      'Tra cứu hơn 240 biển báo giao thông theo QCVN 41: biển báo nguy hiểm, biển cấm, biển hiệu lệnh, biển chỉ dẫn, biển phụ và vạch kẻ đường, kèm hình ảnh và ý nghĩa.',
  },
  '/tips': {
    title: 'Mẹo thi lý thuyết lái xe – mẹo nhớ câu điểm liệt, biển báo, sa hình',
    description:
      'Tổng hợp mẹo ghi nhớ đáp án thi lý thuyết GPLX: cách đọc câu hỏi, câu điểm liệt, mẹo biển báo, sa hình và các con số tốc độ, khoảng cách cần nhớ.',
  },
  '/topics': {
    title: 'Ôn lý thuyết lái xe theo chương',
    description:
      'Ôn 600 câu lý thuyết lái xe theo từng chương: khái niệm và quy tắc giao thông, nghiệp vụ vận tải, văn hóa giao thông, kỹ thuật lái xe, cấu tạo sửa chữa, biển báo, sa hình.',
  },
  [paths.critical]: {
    title: '60 câu điểm liệt thi lý thuyết lái xe ô tô 2026 có đáp án',
    description:
      'Danh sách đủ 60 câu điểm liệt trong bộ 600 câu lý thuyết lái xe, kèm đáp án đúng và giải thích. Sai 1 câu điểm liệt là trượt, hãy ôn kỹ trước khi thi thử.',
  },
  [paths.allQuestions]: {
    title: '600 câu hỏi lý thuyết lái xe ô tô có đáp án mới nhất',
    description:
      'Tra cứu đủ 600 câu hỏi lý thuyết sát hạch lái xe ô tô hạng B, C1, C, D kèm đáp án và giải thích, chia theo 6 chương: quy tắc giao thông, văn hóa, kỹ thuật lái xe, cấu tạo, biển báo, sa hình.',
  },
  '/quiz': {
    title: 'Làm bài lý thuyết lái xe',
    description: DEFAULT_SEO.description,
    noindex: true,
  },
  '/profile': {
    title: 'Cá nhân – hạng bằng và tiến trình học',
    description: 'Chọn hạng bằng, xem tiến trình ôn tập và kết quả thi thử của bạn.',
    noindex: true,
  },
};

/** SEO for the generated content pages: questions, signs, chapters and license classes. */
const dynamicSeo = (pathname: string): PageSeo | undefined => {
  const [, section, slug = ''] = pathname.split('/');
  switch (section) {
    case 'cau-hoi': {
      const q = questionById(slug);
      if (!q) return undefined;
      return {
        title: `Câu ${q.id}: ${clip(q.text, 70)}`,
        description: clip(
          `${q.isCritical ? 'Câu điểm liệt. ' : ''}${q.text} Đáp án đúng: ${correctAnswer(q)} ${q.hint ?? ''}`,
          160,
        ),
        image: questionImageUri(q),
      };
    }
    case 'bien-bao': {
      const sign = signBySlug(slug);
      if (!sign) return undefined;
      const label = signLabel(sign);
      return {
        title: `${label} – ý nghĩa, hình ảnh`,
        image: signImageUri(sign),
        description: clip(
          `${label} thuộc nhóm ${SIGN_GROUP_LABEL[sign.group].toLowerCase()} theo QCVN 41. ${sign.meaning ?? ''}`,
          160,
        ),
      };
    }
    case 'chuong': {
      const chapter = chapterBySlug(slug);
      if (!chapter) return undefined;
      const count = questionsInChapter(chapter).length;
      return {
        title: `${chapter.chapter}: ${chapterName(chapter.id)} – ${count} câu có đáp án`,
        description: clip(
          `${chapter.chapter} – ${chapterName(chapter.id)}: ${count} câu hỏi lý thuyết lái xe (${chapter.range}) kèm đáp án đúng và giải thích, dùng cho các hạng B, C1, C, D.`,
          160,
        ),
      };
    }
    case 'thi-thu': {
      const c = classBySlug(slug);
      if (!c) return undefined;
      return {
        title: `Thi thử lý thuyết lái xe hạng ${c.id} 2026 – ${c.exam.questionCount} câu, miễn phí`,
        description: clip(
          `Thi thử lý thuyết bằng lái hạng ${c.id} (${c.title.toLowerCase()}): ${c.exam.questionCount} câu trong ${c.exam.timeMinutes} phút, đúng ${c.exam.passingScore} câu là đạt, không sai câu điểm liệt. Ôn 600 câu và ${CRITICAL_QUESTIONS.length} câu điểm liệt có đáp án.`,
          160,
        ),
      };
    }
    default:
      return undefined;
  }
};

export const seoForPath = (pathname: string): PageSeo =>
  PAGE_SEO[pathname] ?? dynamicSeo(pathname) ?? { ...DEFAULT_SEO, noindex: true };

export const canonicalUrl = (pathname: string) => `${SITE_URL}${pathname === '/' ? '/' : pathname}`;

export const pageTitle = (pathname: string) => {
  const { title } = seoForPath(pathname);
  return pathname === '/' ? title : `${title} | ${SITE_NAME}`;
};

const metadataFor = (pathname: string): Metadata => {
  const { description, noindex, image: pageImage } = seoForPath(pathname);
  const title = pageTitle(pathname);
  const url = canonicalUrl(pathname);
  const image = pageImage
    ? { url: `${SITE_URL}${pageImage}`, alt: title }
    : { url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME };
  return {
    title,
    description,
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: SITE_NAME, locale: 'vi_VN', title, description, url, images: image },
    twitter: { card: 'summary_large_image', title, description, images: image.url },
  };
};

/**
 * Export from a route file as `generateMetadata`: Expo Router writes these tags into the
 * statically rendered HTML of that page.
 */
export const routeMetadata =
  (pathname: string): GenerateMetadataFunction =>
  () =>
    metadataFor(pathname);

/** `generateMetadata` for a dynamic route: builds the page's pathname from its params. */
export const dynamicRouteMetadata =
  (toPath: (param: string) => string, key: string): GenerateMetadataFunction =>
  (_request, params) => {
    const value = params[key];
    return metadataFor(toPath(Array.isArray(value) ? (value[0] ?? '') : (value ?? '')));
  };
