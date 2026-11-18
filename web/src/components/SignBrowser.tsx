import { useEffect, useMemo, useState } from 'react';
import { Icon } from './Icon';
import type { Sign, SignGroup } from '../lib/types';

type Props = {
  signs: (Sign & { href: string })[];
  groups: { id: SignGroup; label: string }[];
};

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase();

/** Search and group filter over the sign list, with a detail popup. Every card is also a real link. */
export default function SignBrowser({ signs, groups }: Props) {
  const [group, setGroup] = useState<SignGroup | 'all'>('all');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<(typeof signs)[number] | null>(null);

  const list = useMemo(() => {
    const q = normalize(query.trim());
    return signs.filter(
      (s) => (group === 'all' || s.group === group) && (!q || normalize(`${s.id} ${s.name} ${s.meaning ?? ''}`).includes(q)),
    );
  }, [signs, group, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const tabs = [{ id: 'all' as const, label: 'Tất cả' }, ...groups];

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 space-y-3 bg-ink/85 px-4 py-3 backdrop-blur-md sm:mx-0 sm:px-0">
        <label className="card flex items-center gap-2 px-3">
          <Icon name="search" size={18} className="text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc số hiệu, ví dụ: P.102, cấm đỗ"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setGroup(t.id)}
              aria-pressed={group === t.id}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${group === t.id ? 'border-brand bg-brand text-white' : 'border-line bg-surface text-soft hover:text-white'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-muted">{list.length} biển</p>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((s) => (
          <li key={s.id}>
            <a
              href={s.href}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) return;
                e.preventDefault();
                setOpen(s);
              }}
              className="card flex h-full flex-col items-center p-3 text-center transition hover:border-brand/40 hover:bg-raised/60"
            >
              <span className="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-white p-2">
                {s.imageUrl && <img src={s.imageUrl} alt={s.name} loading="lazy" className="max-h-full max-w-full object-contain" />}
              </span>
              {s.group !== 'vachke' && <span className="mt-2 text-xs font-bold text-sky-300">{s.id}</span>}
              <span className="mt-1 line-clamp-2 text-xs leading-snug text-soft">{s.name}</span>
            </a>
          </li>
        ))}
      </ul>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={open.name}
          onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        >
          <div className="card w-full max-w-md rounded-b-none bg-surface p-6 sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <span className="chip">{open.group === 'vachke' ? 'Vạch kẻ đường' : open.id}</span>
              <button type="button" onClick={() => setOpen(null)} aria-label="Đóng" className="text-muted hover:text-white">
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="mt-4 flex h-44 items-center justify-center rounded-2xl bg-white p-4">
              {open.imageUrl && <img src={open.imageUrl} alt={open.name} className="max-h-full max-w-full object-contain" />}
            </div>
            <h2 className="mt-4 text-lg font-bold">{open.name}</h2>
            {open.meaning && <p className="mt-2 text-sm leading-relaxed text-soft">{open.meaning}</p>}
            <a href={open.href} className="btn btn-ghost mt-5 w-full">
              Mở trang chi tiết <Icon name="arrow-right" size={16} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
