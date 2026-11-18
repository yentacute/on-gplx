import { Icon } from './Icon';
import { getExamReveal, getExamScores, setExamReveal, useStored, type ExamReveal } from '../lib/progress';

type HeroProps = { classId: string; examIds: number[]; examHref: string };

/** Passed count, progress bar and the "start next exam" button inside the blue exam hero. */
export function ExamHeroProgress({ classId, examIds, examHref }: HeroProps) {
  const scores = useStored(getExamScores, {});
  const passed = examIds.filter((id) => scores[`${classId}-${id}`]?.passed).length;
  const next = examIds.find((id) => !scores[`${classId}-${id}`]?.passed) ?? examIds[0]!;
  const pct = Math.round((passed / examIds.length) * 100);
  return (
    <>
      <p className="xt-hero-score">
        <b>
          {passed}/{examIds.length}
        </b>
        <span>đề đã đạt</span>
      </p>
      <span className="xt-hero-bar">
        <span style={{ width: `${pct}%` }} />
      </span>
      <a href={examHref.replace('{id}', String(next))} className="xt-hero-start">
        <Icon name="play" size={16} className="fill-current" /> Bắt đầu thi thử · Đề số {next}
      </a>
    </>
  );
}

const MODES: { id: ExamReveal; label: string; icon: 'zap' | 'flag'; note: string }[] = [
  { id: 'each', label: 'Sau mỗi câu', icon: 'zap', note: 'Biết đúng sai ngay sau mỗi câu, hợp để luyện.' },
  { id: 'submit', label: 'Khi nộp bài', icon: 'flag', note: 'Chỉ xem kết quả ở cuối, giống thi thật.' },
];

/** Segmented switch for when a mock exam reveals answers; the quiz screen reads the same setting. */
export function ExamRevealToggle() {
  const mode = useStored(getExamReveal, 'submit');
  return (
    <div>
      <div className="xt-seg" role="radiogroup" aria-label="Cách xem đáp án">
        {MODES.map((m) => (
          <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} onClick={() => setExamReveal(m.id)}>
            <Icon name={m.icon} size={15} /> {m.label}
          </button>
        ))}
      </div>
      <p className="xt-seg-note">{MODES.find((m) => m.id === mode)!.note}</p>
    </div>
  );
}

/** "Chưa làm" / "Đạt 28/30" / "Trượt 20/30" under each exam in the grid. */
export function ExamCellStatus({ examKey }: { examKey: string }) {
  const scores = useStored(getExamScores, {});
  const s = scores[examKey];
  if (!s) return <small>Chưa làm</small>;
  return (
    <small className={s.passed ? 'text-emerald-600' : 'text-red-600'}>
      {s.passed ? 'Đạt' : 'Trượt'} {s.correct}/{s.total}
    </small>
  );
}
