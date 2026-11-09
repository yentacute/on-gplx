import type { TipSection } from '@/types';
import tipsJson from './tips.json';

/** Memory tips grouped into sections, shown on the Tips screen. */
export const TIP_SECTIONS = tipsJson as TipSection[];
