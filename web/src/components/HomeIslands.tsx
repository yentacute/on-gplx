import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon';
import { DEFAULT_CLASS, getAnswers, getExamScores, getLicenseClass, setLicenseClass, useStored } from '../lib/progress';
import type { LicenseClass } from '../lib/types';

/** Class picker plus the exam facts for the chosen class, shown in the home hero. */
export function ClassBar({ classes, total }: { classes: LicenseClass[]; total: number }) {
  const selectedId = useStored(getLicenseClass, DEFAULT_CLASS);
  const selected = classes.find((c) => c.id === selectedId) ?? classes[0]!;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const facts = [
    { value: selected.exam.questionCount, label: 'Câu/đề' },
    { value: `${selected.exam.timeMinutes}'`, label: 'Thời gian' },
    { value: `${selected.exam.passingScore}/${selected.exam.questionCount}`, label: 'Điểm đạt' },
    { value: total, label: 'Tổng câu' },
  ];

  return (
    <div className="card mx-auto flex w-full max-w-2xl flex-col gap-2 p-2 sm:flex-row sm:items-center">
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-br from-brand-strong to-indigo-600 px-3 py-2.5 text-left font-bold shadow-lg shadow-blue-900/40 sm:w-48"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-white/15">
            <Icon name="car" size={18} />
          </span>
          <span className="flex-1">
            <span className="block text-base leading-tight">Hạng {selected.id}</span>
            <span className="block truncate text-[11px] font-medium text-white/75">{selected.title}</span>
          </span>
          <Icon name="chevron-down" size={18} className={`transition ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <ul
            role="listbox"
            className="card absolute left-0 top-full z-30 mt-2 grid max-h-80 w-full min-w-64 grid-cols-1 overflow-y-auto bg-surface p-1.5 shadow-2xl sm:w-72"
          >
            {classes.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.id === selected.id}
                  onClick={() => {
                    setLicenseClass(c.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-raised ${c.id === selected.id ? 'bg-brand-soft' : ''}`}
                >
                  <span className="w-10 font-bold text-sky-300">{c.id}</span>
                  <span className="flex-1 text-soft">{c.title}</span>
                  {c.id === selected.id && <Icon name="check" size={16} className="text-sky-300" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <dl className="grid flex-1 grid-cols-4 text-center">
        {facts.map((f) => (
          <div key={f.label} className="rounded-lg py-1.5">
            <dt className="order-2 text-[11px] text-muted">{f.label}</dt>
            <dd className="text-base font-bold tabular-nums">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

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
      tone: 'text-red-300 bg-red-500/15',
    },
    {
      icon: 'book' as const,
      title: 'Ôn hết 600 câu theo chương',
      detail: `${done}/${total} câu đã làm`,
      href: `/on-tap/${next.slug}`,
      done: done >= total,
      tone: 'text-sky-300 bg-sky-500/15',
    },
    {
      icon: 'refresh' as const,
      title: 'Luyện lại câu hay sai',
      detail: wrong ? `${wrong} câu cần xem lại` : 'Chưa có câu sai',
      href: '/on-tap/cau-sai',
      done: done > 0 && wrong === 0,
      tone: 'text-amber-300 bg-amber-500/15',
    },
    {
      icon: 'trophy' as const,
      title: `Thi thử hạng ${classId} đến khi đỗ`,
      detail: Object.keys(scores).length ? `Đã thi ${Object.keys(scores).length} đề, đỗ ${passedExams}` : 'Chưa thi đề nào',
      href: `/thi-thu/hang-${classId.toLowerCase()}`,
      done: passedExams >= 3,
      tone: 'text-emerald-300 bg-emerald-500/15',
    },
  ];

  return (
    <div className="card relative h-full overflow-hidden p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-sky-300">
            <Icon name="target" size={16} /> Lộ trình của bạn
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Mục tiêu đậu hạng {classId}</h2>
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
              <Icon name="chevron-right" size={16} className="text-muted transition group-hover:translate-x-0.5 group-hover:text-white" />
            </a>
          </li>
        ))}
      </ol>
      <a href={`/on-tap/${next.slug}`} className="btn btn-primary mt-5 w-full sm:w-auto">
        {done ? 'Ôn tiếp' : 'Bắt đầu ôn'}: Chương {next.numeral} <Icon name="arrow-right" size={16} />
      </a>
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
    <span className={`text-xs font-semibold ${s.passed ? 'text-emerald-300' : 'text-red-300'}`}>
      {s.passed ? 'Đạt' : 'Trượt'} · {s.correct}/{s.total}
    </span>
  );
}

/** Remembers the class when the learner opens a class page, so the home page follows it. */
export function RememberClass({ id }: { id: string }) {
  useEffect(() => setLicenseClass(id), [id]);
  return null;
}
