import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from './Icon';
import {
  getAnswers,
  loadQuestions,
  recordAnswer,
  recordAnswers,
  recordExamScore,
  resetAnswers,
} from '../lib/progress';
import type { Question } from '../lib/types';

type ExamRules = { key: string; durationSec: number; passCount: number };

type Props = {
  title: string;
  subtitle?: string;
  backHref: string;
  /** Question ids in order. Omit with `onlyWrong` to practise the questions answered wrong so far. */
  ids?: number[];
  onlyWrong?: boolean;
  /** Present for a timed exam: answers stay hidden until the exam is submitted. */
  exam?: ExamRules;
  /** Where "Đề khác" goes after an exam. */
  moreHref?: string;
  /** Build a fresh random exam in the browser: 3 câu điểm liệt plus random others from the class. */
  randomFor?: { classId: string; size: number };
};

const LETTERS = ['A', 'B', 'C', 'D'];

const formatTime = (seconds: number) => {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

const shuffle = <T,>(items: T[]) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

const randomExam = (pool: Question[], size: number) => {
  const critical = shuffle(pool.filter((q) => q.critical)).slice(0, 3);
  const rest = shuffle(pool.filter((q) => !q.critical)).slice(0, size - critical.length);
  return shuffle([...critical, ...rest]);
};

type Status = 'right' | 'wrong' | 'picked' | 'empty';

export default function Quiz({ title, subtitle, backHref, ids, onlyWrong, exam, moreHref, randomFor }: Props) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);
  const [remaining, setRemaining] = useState(exam?.durationSec ?? 0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const isExam = Boolean(exam);
  const reveal = !isExam || reviewing;

  useEffect(() => {
    loadQuestions().then((all) => {
      const byId = new Map(all.map((q) => [q.id, q]));
      const log = getAnswers();
      const list = randomFor
        ? randomExam(all.filter((q) => q.classes.includes(randomFor.classId)), randomFor.size)
        : onlyWrong
          ? all.filter((q) => log[q.id] && !log[q.id]!.correct)
          : (ids ?? []).flatMap((id) => byId.get(id) ?? []);
      setQuestions(list);
      if (!isExam) {
        // Practice keeps earlier answers so learners can pick up where they left off.
        const prior: Record<number, number> = {};
        for (const q of list) if (log[q.id] && !onlyWrong) prior[q.id] = log[q.id]!.picked;
        setPicked(prior);
        const firstOpen = list.findIndex((q) => prior[q.id] === undefined);
        setIndex(firstOpen === -1 ? 0 : firstOpen);
      }
    });
  }, []);

  const submit = useCallback(() => {
    if (!questions || !exam) return;
    const correct = questions.filter((q) => picked[q.id] === q.answer).length;
    const criticalFailed = questions.some((q) => q.critical && picked[q.id] !== q.answer);
    recordAnswers(
      questions.flatMap((q) =>
        picked[q.id] === undefined ? [] : [{ id: q.id, picked: picked[q.id]!, correct: picked[q.id] === q.answer }],
      ),
    );
    recordExamScore(exam.key, {
      correct,
      total: questions.length,
      passed: !criticalFailed && correct >= exam.passCount,
      at: Date.now(),
    });
    setSubmitted(true);
    setConfirmSubmit(false);
    window.scrollTo({ top: 0 });
  }, [questions, picked, exam]);

  // Exam countdown; submits by itself when time runs out.
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    if (!exam || !questions || submitted) return;
    const timer = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clearInterval(timer);
          submitRef.current();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam, questions, submitted]);

  const current = questions?.[index];

  const choose = (option: number) => {
    if (!current || (submitted && isExam)) return;
    if (!isExam && picked[current.id] !== undefined) return;
    setPicked((p) => ({ ...p, [current.id]: option }));
    if (!isExam) recordAnswer(current.id, option, option === current.answer);
  };

  const go = (next: number) => {
    if (!questions) return;
    setIndex(Math.max(0, Math.min(questions.length - 1, next)));
    setGridOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight') go(index + 1);
      else if (e.key === 'ArrowLeft') go(index - 1);
      else if (/^[1-4]$/.test(e.key) && current && Number(e.key) <= current.options.length) choose(Number(e.key) - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const statusOf = (q: Question): Status => {
    const p = picked[q.id];
    if (p === undefined) return 'empty';
    if (!reveal) return 'picked';
    return p === q.answer ? 'right' : 'wrong';
  };

  const stats = useMemo(() => {
    const list = questions ?? [];
    const answered = list.filter((q) => picked[q.id] !== undefined);
    const right = answered.filter((q) => picked[q.id] === q.answer).length;
    return { answered: answered.length, right, wrong: answered.length - right, total: list.length };
  }, [questions, picked]);

  if (!questions) {
    return (
      <div className="container-page py-20 text-center text-muted" role="status">
        Đang tải câu hỏi…
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container-page py-16">
        <div className="card mx-auto max-w-md p-8 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300">
            <Icon name="check" size={28} />
          </div>
          <h1 className="mt-4 text-lg font-bold">Chưa có câu nào làm sai</h1>
          <p className="mt-1 text-sm text-muted">Câu bạn trả lời sai khi ôn tập hay thi thử sẽ được gom vào đây để luyện lại.</p>
          <a href="/on-tap" className="btn btn-primary mt-6">
            Bắt đầu ôn tập
          </a>
        </div>
      </div>
    );
  }

  if (isExam && submitted && !reviewing) {
    const criticalFailed = questions.some((q) => q.critical && picked[q.id] !== q.answer);
    const passed = !criticalFailed && stats.right >= exam!.passCount;
    return (
      <div className="container-page py-8">
        <div className="card mx-auto max-w-lg overflow-hidden">
          <div className={`p-8 text-center ${passed ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <div
              className={`mx-auto grid size-16 place-items-center rounded-2xl ${passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}
            >
              <Icon name={passed ? 'trophy' : 'x'} size={30} />
            </div>
            <p className={`mt-4 text-sm font-semibold ${passed ? 'text-emerald-300' : 'text-red-300'}`}>
              {passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
            </p>
            <p className="mt-1 text-5xl font-extrabold tabular-nums">
              {stats.right}
              <span className="text-2xl text-muted">/{questions.length}</span>
            </p>
            <p className="mt-2 text-sm text-soft">
              Cần đúng {exam!.passCount} câu và không sai câu điểm liệt.
              {criticalFailed && <span className="block font-semibold text-red-300">Bạn đã sai câu điểm liệt.</span>}
            </p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-line border-y border-line text-center">
            <Stat value={stats.right} label="Đúng" tone="text-emerald-300" />
            <Stat value={stats.wrong} label="Sai" tone="text-red-300" />
            <Stat value={questions.length - stats.answered} label="Bỏ trống" tone="text-soft" />
          </div>
          <div className="flex flex-col gap-2 p-5 sm:flex-row">
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => {
                setReviewing(true);
                const firstWrong = questions.findIndex((q) => picked[q.id] !== q.answer);
                setIndex(firstWrong === -1 ? 0 : firstWrong);
              }}
            >
              <Icon name="eye" size={18} /> Xem lại bài làm
            </button>
            <a href={moreHref ?? backHref} className="btn btn-ghost flex-1">
              <Icon name="refresh" size={18} /> Làm đề khác
            </a>
          </div>
        </div>
      </div>
    );
  }

  const q = current!;
  const pickedNow = picked[q.id];
  const answeredNow = pickedNow !== undefined;
  const progress = Math.round((stats.answered / stats.total) * 100);
  const lowTime = isExam && !submitted && remaining <= 60;

  return (
    <div className="container-page py-4 sm:py-6">
      {/* Top bar */}
      <div className="card flex items-center gap-3 p-3">
        <a href={backHref} className="grid size-9 shrink-0 place-items-center rounded-xl bg-raised text-soft hover:text-white" aria-label="Quay lại">
          <Icon name="arrow-left" size={18} />
        </a>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold sm:text-base">{title}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <span className="hidden truncate sm:inline">{subtitle ?? `${stats.total} câu`}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="text-sky-300">
              {stats.answered}/{stats.total} đã làm
            </span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-raised">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        {isExam && !submitted && (
          <div
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 font-mono text-sm font-bold tabular-nums ${lowTime ? 'bg-red-500/15 text-red-300' : 'bg-raised text-white'}`}
            role="timer"
            aria-label="Thời gian còn lại"
          >
            <Icon name="clock" size={16} />
            {formatTime(remaining)}
          </div>
        )}
        {isExam && !submitted && (
          <button type="button" className="btn btn-primary px-3" onClick={() => setConfirmSubmit(true)}>
            Nộp bài
          </button>
        )}
        {reviewing && (
          <button type="button" className="btn btn-ghost hidden sm:inline-flex" onClick={() => setReviewing(false)}>
            Kết quả
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Question */}
        <article className="card p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">Câu {index + 1}</span>
            <span className="text-xs text-muted">#{q.id} trong bộ 600 câu</span>
            {q.critical && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-300">
                <Icon name="alert" size={12} /> Điểm liệt
              </span>
            )}
          </div>
          <h2 className="mt-3 text-base font-semibold leading-relaxed sm:text-lg">{q.text}</h2>
          {q.image && (
            <img
              src={q.image}
              alt={`Hình minh họa câu ${q.id}`}
              className="mt-4 max-h-80 w-auto max-w-full rounded-xl border border-line bg-white object-contain"
            />
          )}

          <ul className="mt-5 space-y-2.5">
            {q.options.map((option, i) => {
              const isPicked = pickedNow === i;
              const isAnswer = q.answer === i;
              let tone = 'border-line bg-raised/40 hover:border-brand/50 hover:bg-raised';
              let badge = 'bg-raised text-soft';
              if (reveal && answeredNow && isAnswer) {
                tone = 'border-emerald-500/60 bg-emerald-500/10';
                badge = 'bg-emerald-500 text-white';
              } else if (reveal && isPicked && !isAnswer) {
                tone = 'border-red-500/60 bg-red-500/10';
                badge = 'bg-red-500 text-white';
              } else if (reveal && reviewing && isAnswer) {
                tone = 'border-emerald-500/60 bg-emerald-500/10';
                badge = 'bg-emerald-500 text-white';
              } else if (isPicked) {
                tone = 'border-brand bg-brand-soft';
                badge = 'bg-brand text-white';
              }
              const locked = (!isExam && answeredNow) || submitted;
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => choose(i)}
                    disabled={locked && !isPicked && !(reveal && isAnswer)}
                    aria-pressed={isPicked}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm leading-relaxed transition disabled:opacity-60 sm:text-[15px] ${tone} ${locked ? 'cursor-default' : ''}`}
                  >
                    <span className={`grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${badge}`}>{LETTERS[i]}</span>
                    <span className="pt-0.5">{option}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {reveal && (answeredNow || reviewing) && q.hint && (
            <div className="mt-5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm leading-relaxed text-amber-100">
              <p className="mb-1 flex items-center gap-1.5 font-semibold text-amber-300">
                <Icon name="bulb" size={16} /> Giải thích
              </p>
              {q.hint}
            </div>
          )}

          <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-2 border-t border-line bg-ink/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:static sm:mt-6 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-4 sm:backdrop-blur-none">
            <button type="button" className="btn btn-ghost" onClick={() => go(index - 1)} disabled={index === 0}>
              <Icon name="arrow-left" size={16} /> <span className="hidden sm:inline">Câu trước</span>
            </button>
            <button type="button" className="btn btn-ghost lg:hidden" onClick={() => setGridOpen(true)}>
              <Icon name="grid" size={16} /> {index + 1}/{questions.length}
            </button>
            {index < questions.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={() => go(index + 1)}>
                <span className="hidden sm:inline">Câu tiếp theo</span> <Icon name="arrow-right" size={16} />
              </button>
            ) : isExam && !submitted ? (
              <button type="button" className="btn btn-primary" onClick={() => setConfirmSubmit(true)}>
                Nộp bài
              </button>
            ) : (
              <a href={backHref} className="btn btn-primary">
                Xong <Icon name="check" size={16} />
              </a>
            )}
          </div>
        </article>

        {/* Question grid: sidebar on desktop, bottom sheet on mobile */}
        <aside
          className={`${gridOpen ? 'fixed inset-0 z-50 flex items-end bg-black/60 lg:static lg:block lg:bg-transparent' : 'hidden lg:block'}`}
          onClick={(e) => e.target === e.currentTarget && setGridOpen(false)}
        >
          <div className="card max-h-[75dvh] w-full overflow-hidden rounded-b-none p-4 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:rounded-b-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">Danh sách câu hỏi</p>
              <span className="chip">{questions.length} câu</span>
              <button type="button" className="lg:hidden" onClick={() => setGridOpen(false)} aria-label="Đóng">
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="-mx-1.5 mt-1.5 grid max-h-[45dvh] grid-cols-6 gap-1.5 overflow-y-auto p-1.5 sm:grid-cols-8 lg:max-h-[50dvh] lg:grid-cols-5">
              {questions.map((item, i) => {
                const s = statusOf(item);
                const tone =
                  s === 'right'
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                    : s === 'wrong'
                      ? 'bg-red-500/20 text-red-200 border-red-500/40'
                      : s === 'picked'
                        ? 'bg-brand-soft text-sky-200 border-brand/40'
                        : 'bg-raised/60 text-soft border-line';
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(i)}
                    className={`relative aspect-square rounded-lg border text-xs font-semibold tabular-nums transition hover:brightness-125 ${tone} ${i === index ? 'ring-2 ring-brand ring-offset-2 ring-offset-surface' : ''}`}
                    aria-label={`Câu ${i + 1}`}
                    aria-current={i === index}
                  >
                    {i + 1}
                    {item.critical && <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-red-400" />}
                  </button>
                );
              })}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs text-muted">
              {reveal ? (
                <>
                  <Legend className="bg-emerald-500/40" label={`Đúng (${stats.right})`} />
                  <Legend className="bg-red-500/40" label={`Sai (${stats.wrong})`} />
                </>
              ) : (
                <Legend className="bg-brand/50" label={`Đã chọn (${stats.answered})`} />
              )}
              <Legend className="bg-raised" label={`Chưa làm (${stats.total - stats.answered})`} />
              <Legend className="bg-red-400" round label="Câu điểm liệt" />
            </ul>
            {isExam && !submitted && (
              <button type="button" className="btn btn-primary mt-4 w-full" onClick={() => setConfirmSubmit(true)}>
                Nộp bài
              </button>
            )}
            {!isExam && stats.answered > 0 && (
              <button
                type="button"
                className="btn btn-ghost mt-4 w-full"
                onClick={() => {
                  resetAnswers(questions.map((x) => x.id));
                  setPicked({});
                  go(0);
                }}
              >
                <Icon name="refresh" size={16} /> Làm lại từ đầu
              </button>
            )}
          </div>
        </aside>
      </div>

      {confirmSubmit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="card w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold">Nộp bài?</h2>
            <p className="mt-2 text-sm text-muted">
              Bạn đã làm {stats.answered}/{stats.total} câu
              {stats.answered < stats.total && `, còn ${stats.total - stats.answered} câu bỏ trống`}.
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" className="btn btn-ghost flex-1" onClick={() => setConfirmSubmit(false)}>
                Làm tiếp
              </button>
              <button type="button" className="btn btn-primary flex-1" onClick={submit}>
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Stat = ({ value, label, tone }: { value: number; label: string; tone: string }) => (
  <div className="py-4">
    <p className={`text-xl font-bold tabular-nums ${tone}`}>{value}</p>
    <p className="text-xs text-muted">{label}</p>
  </div>
);

const Legend = ({ className, label, round }: { className: string; label: string; round?: boolean }) => (
  <li className="flex items-center gap-2">
    <span className={`${round ? 'size-2 rounded-full' : 'size-3 rounded'} ${className}`} />
    {label}
  </li>
);
