import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';
import { QUESTIONS } from './index';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type TopicMeta = {
  /** The full category name, used to filter questions. */
  id: string;
  title: string;
  chapter: string;
  range: string;
  icon: IconName;
  color: string;
};

const PALETTE: { icon: IconName; color: string }[] = [
  { icon: 'book', color: '#2563eb' },
  { icon: 'heart', color: '#db2777' },
  { icon: 'car-sport', color: '#0891b2' },
  { icon: 'construct', color: '#0f766e' },
  { icon: 'warning', color: '#ea580c' },
  { icon: 'git-merge', color: '#7c3aed' },
];

export const TOPIC_META: TopicMeta[] = [...new Set(QUESTIONS.map((q) => q.category))].map((category, index) => {
  const inCategory = QUESTIONS.filter((q) => q.category === category);
  const firstId = inCategory[0]?.id;
  const lastId = inCategory[inCategory.length - 1]?.id;
  const chapter = category.match(/^Chương [IVX]+/)?.[0] ?? `Danh mục ${index + 1}`;
  const title = category.replace(/^Chương [IVX]+\.\s*/, '');
  const palette = PALETTE[index % PALETTE.length] ?? PALETTE[0]!;
  return { id: category, title, chapter, range: `Câu ${firstId}–${lastId}`, ...palette };
});
