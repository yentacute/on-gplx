export type Question = {
  id: number;
  text: string;
  options: string[];
  /** Index into `options`. */
  answer: number;
  hint?: string;
  /** Câu điểm liệt: a wrong answer fails the whole exam. */
  critical: boolean;
  /** Full chapter name, e.g. "Chương V. Báo hiệu đường bộ". */
  chapter: string;
  classes: string[];
  image?: string;
};

export type SignGroup = 'nguyhiem' | 'cam' | 'hieulenh' | 'chidan' | 'phu' | 'vachke';

export type Sign = {
  id: string;
  group: SignGroup;
  name: string;
  meaning?: string;
  image?: string;
  imageUrl?: string;
};

export type LicenseClass = {
  id: string;
  group: 'moto' | 'car';
  title: string;
  minAge: number;
  description: string;
  exam: { questionCount: number; timeMinutes: number; passingScore: number };
};

export type TipPoint = { text: string; kind?: 'do' | 'dont' | 'info' };
export type TipStat = { label: string; value: number; detail: string; chance?: number };
export type Tip = { title: string; takeaway: string; points?: TipPoint[]; stats?: TipStat[]; questions?: number[] };
export type TipSection = {
  id: string;
  short: string;
  title: string;
  summary: string;
  icon: string;
  color: string;
  tips: Tip[];
};
