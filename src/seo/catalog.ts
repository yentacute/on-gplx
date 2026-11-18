import { Asset } from 'expo-asset';
import type { ImageSourcePropType } from 'react-native';
import { QUESTIONS, SIGNS } from '@/data';
import { QUESTION_IMAGES } from '@/data/questionImages';
import { SIGN_IMAGES } from '@/data/signImages';
import { LICENSE_CLASSES } from '@/data/licenseClasses';
import { TOPIC_META, type TopicMeta } from '@/data/topics';
import type { LicenseClass, Question, TrafficSign } from '@/types';
import { LANDING_CLASS_IDS, chapterSlug, slugify } from './slugs';

// Lookups for the indexable content pages: one per question, sign, chapter and license class.

export const CRITICAL_QUESTIONS = QUESTIONS.filter((q) => q.isCritical);

export const questionById = (id: string | number) => QUESTIONS.find((q) => q.id === Number(id));

/** The question before and after this one in the bank, for prev/next links. */
export const neighbours = (q: Question) => {
  const index = QUESTIONS.indexOf(q);
  return { prev: QUESTIONS[index - 1], next: QUESTIONS[index + 1] };
};

export const signBySlug = (slug: string) => SIGNS.find((s) => slugify(s.id) === slug);

export const signsInGroup = (sign: TrafficSign) => SIGNS.filter((s) => s.group === sign.group);

export const chapterBySlug = (slug: string): TopicMeta | undefined => TOPIC_META.find((t) => chapterSlug(t.id) === slug);

export const chapterOf = (q: Question) => TOPIC_META.find((t) => t.id === q.category);

export const questionsInChapter = (chapter: TopicMeta) => QUESTIONS.filter((q) => q.category === chapter.id);

export const LANDING_CLASSES: LicenseClass[] = LANDING_CLASS_IDS.flatMap((id) => {
  const found = LICENSE_CLASSES.find((c) => c.id === id);
  return found ? [found] : [];
});

export const classBySlug = (slug: string) => LANDING_CLASSES.find((c) => `hang-${c.id.toLowerCase()}` === slug);

export const correctAnswer = (q: Question) => q.options[q.answer] ?? '';

/** Cuts text at a word boundary so titles and descriptions fit search result snippets. */
export const clip = (text: string, max: number) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, '')}…`;
};

/** "Chương V. Báo hiệu đường bộ" → "Báo hiệu đường bộ". */
export const chapterName = (category: string) => category.replace(/^Chương [IVX]+\.\s*/, '');

export const signLabel = (s: TrafficSign) => (s.group === 'vachke' ? s.name : `Biển ${s.id} ${s.name}`);

/** Site-relative URL of a bundled image on web, e.g. "/assets/assets/questions/q227.<hash>.jpg". */
export const assetUri = (source: ImageSourcePropType | undefined): string | undefined => {
  if (typeof source === 'number') return Asset.fromModule(source).uri;
  if (source && !Array.isArray(source) && typeof source === 'object' && 'uri' in source) return source.uri;
  return undefined;
};

export const questionImageUri = (q: Question) => {
  const key = q.images?.[0];
  return key ? assetUri(QUESTION_IMAGES[key]?.source) : undefined;
};

export const signImageUri = (s: TrafficSign) => (s.image ? assetUri(SIGN_IMAGES[s.image]) : undefined);
