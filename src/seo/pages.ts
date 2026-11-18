import type { GenerateMetadataFunction, Metadata } from 'expo-server';

/** Public address of the web build. Canonical URLs, Open Graph and the sitemap use it. */
export const SITE_URL = 'https://ontaplaixe.com';
export const SITE_NAME = 'Ôn thi GPLX';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

export type PageSeo = {
  title: string;
  description: string;
  /** Kept out of search results: personal or state-dependent screens. */
  noindex?: boolean;
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

export const seoForPath = (pathname: string): PageSeo => PAGE_SEO[pathname] ?? { ...DEFAULT_SEO, noindex: true };

export const canonicalUrl = (pathname: string) => `${SITE_URL}${pathname === '/' ? '/' : pathname}`;

export const pageTitle = (pathname: string) => {
  const { title } = seoForPath(pathname);
  return pathname === '/' ? title : `${title} | ${SITE_NAME}`;
};

const metadataFor = (pathname: string): Metadata => {
  const { description, noindex } = seoForPath(pathname);
  const title = pageTitle(pathname);
  const url = canonicalUrl(pathname);
  const image = { url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME };
  return {
    title,
    description,
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: SITE_NAME, locale: 'vi_VN', title, description, url, images: image },
    twitter: { card: 'summary_large_image', title, description, images: OG_IMAGE },
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
