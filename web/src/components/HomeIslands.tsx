import { useEffect } from 'react';
import { Icon } from './Icon';
import { DEFAULT_CLASS, getAnswers, getExamScores, getLicenseClass, setLicenseClass, useStored } from '../lib/progress';

type ChapterLite = { slug: string; numeral: string; name: string; ids: number[] };

/** "Lộ trình của bạn": what the learner has done so far and the next step. */
export function RoadmapCard({ chapters, criticalIds }: { chapters: ChapterLite[]; criticalIds: number[] }) {
  const answers = useStored(getAnswers, {});
  const scores = useStored(getExamScores, {});
  const classId = useStored(getLicenseClass, DEFAULT_CLASS);
  const total = chapters.reduce((n, c) => n + c.ids.length, 0);
  const done = Object.keys(answers).length;
  const wrong = Object.values(answers).filter((a) => !a.correct).length;
  const criticalDone = criticalIds.filter((id) => answers[id]?.correct).length;
  const passedExams = Object.values(scores).filter((s) => s.passed).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const next = chapters.find((c) => c.ids.some((id) => !answers[id])) ?? chapters[0]!;

  const steps = [
    {
      icon: 'alert' as const,
      title: 'Thuộc 60 câu điểm liệt',
      detail: `${criticalDone}/${criticalIds.length} câu đã làm đúng`,
      href: '/on-tap/cau-diem-liet',
      done: criticalDone === criticalIds.length,
      tone: 'text-red-600 bg-red-500/15',
    },
    {
      icon: 'book' as const,
      title: 'Ôn hết 600 câu theo chương',
      detail: `${done}/${total} câu đã làm`,
      href: `/on-tap/${next.slug}`,
      done: done >= total,
      tone: 'text-blue-600 bg-sky-500/15',
    },
    {
      icon: 'refresh' as const,
      title: 'Luyện lại câu hay sai',
      detail: wrong ? `${wrong} câu cần xem lại` : 'Chưa có câu sai',
      href: '/on-tap/cau-sai',
      done: done > 0 && wrong === 0,
      tone: 'text-amber-700 bg-amber-500/15',
    },
    {
      icon: 'trophy' as const,
      title: `Thi thử hạng ${classId} đến khi đỗ`,
      detail: Object.keys(scores).length ? `Đã thi ${Object.keys(scores).length} đề, đỗ ${passedExams}` : 'Chưa thi đề nào',
      href: `/thi-thu/hang-${classId.toLowerCase()}`,
      done: passedExams >= 3,
      tone: 'text-emerald-600 bg-emerald-500/15',
    },
  ];

  return (
    <div className="card relative h-full overflow-hidden p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
            <Icon name="target" size={16} /> Lộ trình của bạn
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Mục tiêu đậu hạng {classId}</h2>
          <p className="mt-1 text-sm text-muted">Làm theo 4 bước, tiến độ được lưu trên trình duyệt này.</p>
        </div>
        <ProgressRing percent={percent} />
      </div>
      <ol className="mt-5 grid gap-2 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.title}>
            <a href={s.href} className="group flex items-center gap-3 rounded-xl border border-line bg-raised/40 p-3 transition hover:border-brand/40 hover:bg-raised">
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${s.tone}`}>
                <Icon name={s.done ? 'check' : s.icon} size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  <span className="text-muted">{i + 1}. </span>
                  {s.title}
                </span>
                <span className="block truncate text-xs text-muted">{s.detail}</span>
              </span>
              <Icon name="chevron-right" size={16} className="text-muted transition group-hover:translate-x-0.5 group-hover:text-slate-900" />
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap gap-2">
        <a href={`/on-tap/${next.slug}`} className="btn btn-primary">
          {done ? 'Ôn tiếp' : 'Bắt đầu ôn'}: Chương {next.numeral} <Icon name="arrow-right" size={16} />
        </a>
        <a href="/tien-do" className="btn btn-ghost">Xem tiến độ</a>
      </div>
    </div>
  );
}

const ProgressRing = ({ percent }: { percent: number }) => {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-16 shrink-0 place-items-center sm:size-20">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-raised" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
          className="text-brand transition-all"
        />
      </svg>
      <span className="text-sm font-bold tabular-nums">{percent}%</span>
    </div>
  );
};

/** The blue "Thi thử" card; its button follows the selected class. */
export function ExamCta() {
  const classId = useStored(getLicenseClass, DEFAULT_CLASS);
  return (
    <a href={`/thi-thu/hang-${classId.toLowerCase()}`} className="btn mt-6 bg-white text-brand-strong shadow-lg hover:bg-sky-50">
      Thi thử hạng {classId} <Icon name="arrow-right" size={16} />
    </a>
  );
}

/** Answered-count badge for a chapter tile. */
export function ChapterProgress({ ids }: { ids: number[] }) {
  const answers = useStored(getAnswers, {});
  const done = ids.filter((id) => answers[id]).length;
  const right = ids.filter((id) => answers[id]?.correct).length;
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[11px] text-muted">
        <span>
          {done}/{ids.length} câu
        </span>
        <span>{done ? `${Math.round((right / done) * 100)}% đúng` : 'Chưa làm'}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-raised">
        <div className="h-full rounded-full bg-brand" style={{ width: `${(done / ids.length) * 100}%` }} />
      </div>
    </div>
  );
}

/** Count of questions answered wrong, for the "Câu hay sai" tile. */
export function WrongCount() {
  const answers = useStored(getAnswers, {});
  const wrong = Object.values(answers).filter((a) => !a.correct).length;
  return <>{wrong ? `${wrong} câu cần luyện lại` : 'Chưa có câu sai'}</>;
}

/** Best score badge for each fixed exam on a class page. */
export function ExamScoreBadge({ examKey }: { examKey: string }) {
  const scores = useStored(getExamScores, {});
  const s = scores[examKey];
  if (!s) return <span className="text-xs text-muted">Chưa làm</span>;
  return (
    <span className={`text-xs font-semibold ${s.passed ? 'text-emerald-600' : 'text-red-600'}`}>
      {s.passed ? 'Đạt' : 'Trượt'} · {s.correct}/{s.total}
    </span>
  );
}

/** Remembers the class when the learner opens a class page, so the home page follows it. */
export function RememberClass({ id }: { id: string }) {
  useEffect(() => setLicenseClass(id), [id]);
  return null;
}
