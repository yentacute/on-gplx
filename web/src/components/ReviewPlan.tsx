import { Icon } from './Icon';
import type { IconName } from '../lib/icons';
import {
  DEFAULT_CLASS,
  getAnswers,
  getExamHistory,
  getLicenseClass,
  getSaved,
  getStudySeconds,
  useStored,
  weakQuestionIds,
} from '../lib/progress';
import type { LicenseClass } from '../lib/types';

type ChapterLite = { slug: string; numeral: string; name: string; ids: number[] };
type Props = { classes: LicenseClass[]; chapters: ChapterLite[]; criticalIds: number[] };

const SECONDS_PER_QUESTION = 45;
const minutes = (questions: number) => Math.max(1, Math.round((questions * SECONDS_PER_QUESTION) / 60));

const formatDuration = (seconds: number) => {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} phút`;
  return `${Math.floor(m / 60)} giờ ${m % 60} phút`;
};

const formatDate = (at: number) =>
  new Date(at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

type Task = { icon: IconName; tone: string; title: string; detail: string; minutes: number; href: string };

/** "Cần ôn gì": readiness estimate, the most important next step, a study plan, stats and exam history. */
export default function ReviewPlan({ classes, chapters, criticalIds }: Props) {
  const answers = useStored(getAnswers, {});
  const history = useStored(getExamHistory, []);
  const saved = useStored(getSaved, []);
  const studySeconds = useStored(getStudySeconds, 0);
  const classId = useStored(getLicenseClass, DEFAULT_CLASS);
  const cls = classes.find((c) => c.id === classId) ?? classes[0]!;

  const total = chapters.reduce((n, c) => n + c.ids.length, 0);
  const answered = Object.keys(answers).length;
  const correct = Object.values(answers).filter((a) => a.correct).length;
  const accuracy = answered ? correct / answered : 0;
  const coverage = answered / total;
  const criticalLeft = criticalIds.filter((id) => !answers[id]?.correct);
  const weak = weakQuestionIds(answers);
  const unansweredChapters = chapters
    .map((c) => ({ ...c, left: c.ids.filter((id) => !answers[id]) }))
    .filter((c) => c.left.length > 0);
  const unanswered = total - answered;

  const classExams = history.filter((h) => h.key.startsWith(`${cls.id}-`));
  const recent = classExams.slice(0, 5);
  const passRate = recent.length ? recent.filter((h) => h.passed).length / recent.length : 0;
  const criticalMastery = (criticalIds.length - criticalLeft.length) / criticalIds.length;
  // A rough, explainable estimate: knowing the bank, the điểm liệt questions, and recent exam results.
  const readiness = Math.round(100 * (0.4 * coverage * accuracy + 0.3 * criticalMastery + 0.3 * passRate));

  const tasks: Task[] = [];
  if (criticalLeft.length)
    tasks.push({
      icon: 'alert',
      tone: 'bg-red-500/15 text-red-600',
      title: `Ôn ${criticalLeft.length} câu điểm liệt chưa đúng`,
      detail: 'Sai một câu điểm liệt là trượt cả bài, nên làm đúng hết nhóm này trước.',
      minutes: minutes(criticalLeft.length),
      href: '/on-tap/cau-diem-liet',
    });
  if (weak.length)
    tasks.push({
      icon: 'refresh',
      tone: 'bg-amber-500/15 text-amber-700',
      title: `Luyện lại ${weak.length} câu hay sai`,
      detail: 'Câu sai nhiều lần được đưa lên đầu.',
      minutes: minutes(weak.length),
      href: '/on-tap/cau-sai',
    });
  for (const c of unansweredChapters.slice(0, 3))
    tasks.push({
      icon: 'book',
      tone: 'bg-sky-500/15 text-blue-600',
      title: `Học ${c.left.length} câu chưa làm ở chương ${c.numeral}`,
      detail: c.name,
      minutes: minutes(c.left.length),
      href: `/on-tap/${c.slug}`,
    });
  tasks.push({
    icon: 'clock',
    tone: 'bg-emerald-500/15 text-emerald-600',
    title: recent.length ? `Thi thử hạng ${cls.id} thêm một đề` : `Làm đề thi thử hạng ${cls.id} đầu tiên`,
    detail: recent.length
      ? `Đậu ${recent.filter((h) => h.passed).length}/${recent.length} đề gần nhất. Nên đậu liên tục 3 đề trước khi đi thi.`
      : `${cls.exam.questionCount} câu, ${cls.exam.timeMinutes} phút, cần đúng ${cls.exam.passingScore} câu.`,
    minutes: cls.exam.timeMinutes,
    href: `/thi-thu/hang-${cls.id.toLowerCase()}/ngau-nhien`,
  });
  const [top, ...plan] = tasks;
  const planMinutes = plan.reduce((n, t) => n + t.minutes, 0);

  const tone = readiness >= 80 ? 'text-emerald-600' : readiness >= 50 ? 'text-amber-600' : 'text-red-600';
  const ring = readiness >= 80 ? 'text-emerald-500' : readiness >= 50 ? 'text-amber-500' : 'text-red-500';
  const r = 34;
  const circ = 2 * Math.PI * r;

  return (
    <div className="space-y-4">
      {/* Readiness */}
      <section className="card grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-blue-600">
            <Icon name="target" size={16} /> Lộ trình của bạn · Hạng {cls.id}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Hôm nay ôn gì?</h1>
          <p className="mt-1 text-sm text-muted">
            {top ? `Còn khoảng ${formatDuration((tasks.reduce((n, t) => n + t.minutes, 0)) * 60)} ôn tập theo kế hoạch bên dưới.` : ''}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative grid size-24 place-items-center">
            <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
              <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-raised" />
              <circle
                cx="40"
                cy="40"
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - readiness / 100)}
                className={`${ring} transition-all`}
              />
            </svg>
            <span className={`text-xl font-bold tabular-nums ${tone}`}>{readiness}%</span>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Tỷ lệ đậu dự kiến</p>
            <p className="max-w-44 text-xs text-muted">Tính từ số câu đã làm đúng, câu điểm liệt và 5 đề thi thử gần nhất.</p>
          </div>
        </div>
      </section>

      {/* Most important task */}
      {top && (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-700">
            <Icon name="zap" size={14} /> Việc quan trọng nhất
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${top.tone}`}>
              <Icon name={top.icon} size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{top.title}</p>
              <p className="text-sm text-soft">{top.detail}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                <Icon name="clock" size={12} /> khoảng {top.minutes} phút
              </p>
            </div>
            <a href={top.href} className="btn btn-primary">
              Bắt đầu <Icon name="arrow-right" size={16} />
            </a>
          </div>
        </section>
      )}

      {/* Plan */}
      {plan.length > 0 && (
        <section className="card p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-bold">
              <Icon name="clipboard" size={18} className="text-blue-600" /> Kế hoạch tiếp theo
            </h2>
            <span className="text-xs text-muted">
              {plan.length} việc · khoảng {planMinutes} phút
            </span>
          </div>
          <ol className="mt-3 divide-y divide-line">
            {plan.map((t, i) => (
              <li key={t.title}>
                <a href={t.href} className="group flex items-center gap-3 py-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line text-xs font-bold text-muted">
                    {i + 2}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold group-hover:text-blue-600">{t.title}</span>
                    <span className="block truncate text-xs text-muted">{t.detail}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-soft">
                    <Icon name="clock" size={12} /> {t.minutes} phút
                  </span>
                  <Icon name="chevron-right" size={16} className="text-muted" />
                </a>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Stats */}
      <section>
        <h2 className="flex items-center gap-2 font-bold">
          <Icon name="trophy" size={18} className="text-blue-600" /> Thành tích
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Thời gian ôn" value={formatDuration(studySeconds)} />
          <Stat label="Câu đã làm" value={`${answered}/${total}`} />
          <Stat label="Tỷ lệ đúng" value={answered ? `${Math.round(accuracy * 100)}%` : '–'} />
          <Stat label="Đề đã thi" value={`${history.length} (đậu ${history.filter((h) => h.passed).length})`} />
        </dl>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-bold">
            <Icon name="chart" size={18} className="text-blue-600" /> Theo chương
          </h2>
          <ul className="mt-3 space-y-3">
            {chapters.map((c) => {
              const done = c.ids.filter((id) => answers[id]);
              const right = done.filter((id) => answers[id]!.correct).length;
              const pct = done.length ? Math.round((right / done.length) * 100) : 0;
              return (
                <li key={c.slug}>
                  <a href={`/on-tap/${c.slug}`} className="block">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="truncate">
                        <span className="font-semibold">Chương {c.numeral}.</span> {c.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {done.length}/{c.ids.length} · {done.length ? `${pct}% đúng` : 'chưa làm'}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-raised">
                      <div
                        className={`h-full rounded-full ${pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-brand'}`}
                        style={{ width: `${(done.length / c.ids.length) * 100}%` }}
                      />
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
          <a href="/on-tap/cau-da-luu" className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
            <Icon name="bookmark" size={16} /> Câu đã lưu ({saved.length})
          </a>
        </div>

        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-bold">
            <Icon name="clock" size={18} className="text-blue-600" /> Lịch sử thi thử
          </h2>
          {history.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Chưa có lần thi nào. Kết quả mỗi lần nộp bài sẽ hiện ở đây.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {history.slice(0, 10).map((h) => (
                <li key={h.at} className="flex items-center gap-3 py-2.5 text-sm">
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold ${h.passed ? 'bg-emerald-500/15 text-emerald-700' : 'bg-red-500/15 text-red-700'}`}
                  >
                    {h.passed ? 'Đậu' : 'Trượt'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{h.title}</span>
                    <span className="block text-xs text-muted">
                      {formatDate(h.at)} · {formatDuration(h.seconds)}
                    </span>
                  </span>
                  <span className="font-bold tabular-nums">
                    {h.correct}/{h.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="card p-4">
    <dt className="text-xs text-muted">{label}</dt>
    <dd className="mt-1 text-lg font-bold tabular-nums">{value}</dd>
  </div>
);
