import { lazy, Suspense, useEffect, useState } from 'react';
import { Icon } from './Icon';

const CommunityChat = lazy(() => import('./CommunityChat').then((module) => ({ default: module.CommunityChat })));
const STORAGE_KEY = 'gplx.chat.sidebarOpen';

export function ChatSidebar({ url, publishableKey }: { url: string; publishableKey: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setOpen(saved === null ? window.matchMedia('(min-width: 1500px)').matches : saved === 'true');
    } catch {
      setOpen(window.matchMedia('(min-width: 1500px)').matches);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('chat-sidebar-open', open);
    return () => document.body.classList.remove('chat-sidebar-open');
  }, [open]);

  function changeOpen(value: boolean) {
    setOpen(value);
    try { localStorage.setItem(STORAGE_KEY, String(value)); } catch { /* Storage may be disabled. */ }
  }

  return (
    <>
      {!open && <button className="chat-sidebar-launcher" type="button" onClick={() => changeOpen(true)} aria-label="Mở trò chuyện cộng đồng"><Icon name="chat" size={22} /><span>Trò chuyện</span></button>}
      {open && <button className="chat-sidebar-backdrop" type="button" onClick={() => changeOpen(false)} aria-label="Đóng trò chuyện" />}
      <aside className={`chat-sidebar ${open ? 'chat-sidebar-visible' : ''}`} aria-label="Trò chuyện cộng đồng" aria-hidden={!open} inert={!open}>
        <div className="chat-sidebar-top"><div><span className="chat-sidebar-top-icon"><Icon name="chat" size={20} /></span><strong>Trò chuyện cộng đồng</strong></div><div><a href="/tro-chuyen" aria-label="Mở trang trò chuyện" title="Mở trang trò chuyện"><Icon name="arrow-right" size={19} /></a><button type="button" onClick={() => changeOpen(false)} aria-label="Đóng sidebar trò chuyện" title="Đóng"><Icon name="x" size={19} /></button></div></div>
        {open && <Suspense fallback={<p className="chat-sidebar-loading">Đang mở phòng chat...</p>}><CommunityChat url={url} publishableKey={publishableKey} /></Suspense>}
      </aside>
    </>
  );
}
