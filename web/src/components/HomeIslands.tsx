import { useEffect, useState } from 'react';
import type { IconName } from '../lib/icons';
import type { LicenseClass } from '../lib/types';
import { Icon } from './Icon';
import { DEFAULT_CLASS, getAnswers, getExamScores, getLicenseClass, getSaved, setLicenseClass, useStored } from '../lib/progress';

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

/** Count of bookmarked questions, for the "Câu đã lưu" tile. */
export function SavedCount() {
  const saved = useStored(getSaved, []);
  return <>{saved.length ? `${saved.length} câu đã lưu` : 'Bấm lưu ở câu khó để xem lại'}</>;
}

const MAIN_CLASSES = ['B', 'C1', 'C', 'D1', 'D'];
const classIcon = (id: string): IconName => (id.startsWith('D') ? 'bus' : id.startsWith('C') ? 'truck' : 'car');

/** "Bạn đang học hạng nào?": icon tiles for the common classes; "Tất cả" opens the rest. */
export function ClassPicker({ classes }: { classes: LicenseClass[] }) {
  const selectedId = useStored(getLicenseClass, DEFAULT_CLASS);
  const [showAll, setShowAll] = useState(false);
  const main = classes.filter((c) => MAIN_CLASSES.includes(c.id));
  const others = classes.filter((c) => !MAIN_CLASSES.includes(c.id));
  const otherSelected = others.some((c) => c.id === selectedId);
  const selected = classes.find((c) => c.id === selectedId) ?? main[0];
  return (
    <div>
      <div className="hub-classes">
        {main.map((c) => (
          <button key={c.id} type="button" onClick={() => setLicenseClass(c.id)} aria-pressed={c.id === selectedId} title={c.title} className="hub-class">
            <Icon name={classIcon(c.id)} size={22} />
            <span>{c.id}</span>
          </button>
        ))}
        <button type="button" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll} aria-pressed={otherSelected} className="hub-class">
          <Icon name="dots" size={22} />
          <span>{otherSelected ? selectedId : 'Tất cả'}</span>
        </button>
      </div>
      {showAll && <ClassSheet classes={others} selectedId={selectedId} onPick={setLicenseClass} onClose={() => setShowAll(false)} />}
      {selected && (
        <p className="hub-class-note">
          Hạng <b>{selected.id}</b> · {selected.title} · {selected.exam.questionCount} câu, {selected.exam.timeMinutes} phút, đạt{' '}
          {selected.exam.passingScore}/{selected.exam.questionCount}
        </p>
      )}
    </div>
  );
}

/** Class row on the Thi thử screen: each class opens its own exam page; "Tất cả" opens the popup. */
export function ExamClassSwitch({ classes, currentId, hrefPattern }: { classes: LicenseClass[]; currentId: string; hrefPattern: string }) {
  const [showAll, setShowAll] = useState(false);
  const main = classes.filter((c) => MAIN_CLASSES.includes(c.id));
  const others = classes.filter((c) => !MAIN_CLASSES.includes(c.id));
  const otherSelected = others.some((c) => c.id === currentId);
  const href = (id: string) => hrefPattern.replace('{id}', id.toLowerCase());
  return (
    <div className="hub-classes xt-classes">
      {main.map((c) => (
        <a key={c.id} href={href(c.id)} aria-current={c.id === currentId ? 'page' : undefined} aria-pressed={c.id === currentId} title={c.title} className="hub-class">
          <Icon name={classIcon(c.id)} size={22} />
          <span>{c.id}</span>
        </a>
      ))}
      <button type="button" onClick={() => setShowAll(true)} aria-pressed={otherSelected} className="hub-class">
        <Icon name="dots" size={22} />
        <span>{otherSelected ? currentId : 'Tất cả'}</span>
      </button>
      {showAll && (
        <ClassSheet classes={others} selectedId={currentId} onPick={(id) => (window.location.href = href(id))} onClose={() => setShowAll(false)} />
      )}
    </div>
  );
}

/** Popup listing the less common classes: a bottom sheet on phones, a centered dialog on larger screens. */
function ClassSheet({ classes, selectedId, onPick, onClose }: { classes: LicenseClass[]; selectedId: string; onPick: (id: string) => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);
  return (
    <div className="hub-sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="hub-sheet" role="dialog" aria-modal="true" aria-labelledby="hub-sheet-title">
        <div className="hub-sheet-head">
          <h3 id="hub-sheet-title">Chọn hạng khác</h3>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <Icon name="x" size={20} />
          </button>
        </div>
        <ul className="hub-sheet-list">
          {classes.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                aria-pressed={c.id === selectedId}
                onClick={() => {
                  onPick(c.id);
                  onClose();
                }}
              >
                <span className="hub-sheet-id">{c.id}</span>
                <span className="min-w-0 flex-1">
                  <strong>{c.title}</strong>
                  <small>
                    {c.exam.questionCount} câu · {c.exam.timeMinutes} phút · đạt {c.exam.passingScore}/{c.exam.questionCount}
                  </small>
                </span>
                {c.id === selectedId && <Icon name="check" size={18} className="text-blue-600" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Small progress line inside the "Ôn tập" feature card. */
export function StudyProgress({ total }: { total: number }) {
  const answers = useStored(getAnswers, {});
  const done = Object.keys(answers).length;
  return (
    <span className="hub-feature-progress">
      <span style={{ width: `${Math.round((done / total) * 100)}%` }} />
      <small>
        {done}/{total} câu đã làm
      </small>
    </span>
  );
}

/** "Thi thử" feature card link that follows the selected class. */
export function ExamLink() {
  const classId = useStored(getLicenseClass, DEFAULT_CLASS);
  return (
    <a href={`/thi-thu/hang-${classId.toLowerCase()}`} className="hub-feature-button hub-feature-button-solid">
      Thi hạng {classId} <Icon name="arrow-right" size={17} />
    </a>
  );
}
