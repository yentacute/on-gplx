import type { Question, TrafficSign } from '@/types';
import { SITE_NAME, SITE_URL } from './pages';

export type Crumb = { name: string; path: string };

const absolute = (path: string) => `${SITE_URL}${path}`;

export const breadcrumbJsonLd = (crumbs: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: absolute(c.path),
  })),
});

/** A single multiple-choice question as schema.org Quiz, the shape Google reads for practice questions. */
export const questionJsonLd = (q: Question, path: string, image?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: `Câu ${q.id} lý thuyết lái xe`,
  url: absolute(path),
  inLanguage: 'vi-VN',
  isAccessibleForFree: true,
  educationalLevel: 'Sát hạch giấy phép lái xe',
  about: { '@type': 'Thing', name: 'Lý thuyết lái xe ô tô' },
  provider: { '@type': 'Organization', name: SITE_NAME, url: `${SITE_URL}/` },
  hasPart: {
    '@type': 'Question',
    eduQuestionType: 'Multiple choice',
    learningResourceType: 'Practice problem',
    text: q.text,
    ...(image ? { image: absolute(image) } : {}),
    acceptedAnswer: {
      '@type': 'Answer',
      position: q.answer,
      text: q.options[q.answer],
      ...(q.hint ? { answerExplanation: { '@type': 'Comment', text: q.hint } } : {}),
    },
    suggestedAnswer: q.options.flatMap((text, position) =>
      position === q.answer ? [] : [{ '@type': 'Answer', position, text }],
    ),
  },
});

export const signJsonLd = (sign: TrafficSign, name: string, path: string, image?: string) => ({
  '@context': 'https://schema.org',
  '@type': 'DefinedTerm',
  name,
  termCode: sign.id,
  description: sign.meaning || sign.name,
  url: absolute(path),
  inLanguage: 'vi-VN',
  ...(image ? { image: absolute(image) } : {}),
  inDefinedTermSet: {
    '@type': 'DefinedTermSet',
    name: 'Biển báo giao thông đường bộ Việt Nam (QCVN 41)',
    url: `${SITE_URL}/signs`,
  },
});

export const itemListJsonLd = (name: string, items: Crumb[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    url: absolute(item.path),
  })),
});

export const courseJsonLd = (name: string, description: string, path: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name,
  description,
  url: absolute(path),
  inLanguage: 'vi',
  isAccessibleForFree: true,
  provider: { '@type': 'Organization', name: SITE_NAME, sameAs: `${SITE_URL}/` },
  offers: { '@type': 'Offer', category: 'Free', price: 0, priceCurrency: 'VND' },
  hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: 'PT10H' },
});
