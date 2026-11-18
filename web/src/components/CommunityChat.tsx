import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Icon } from './Icon';

type ChatMessage = {
  id: number;
  author_id: string;
  display_name: string;
  body: string;
  created_at: string;
};

type Connection = 'connecting' | 'connected' | 'offline';
const NAME_KEY = 'gplx.chat.displayName';
const PAGE_SIZE = 50;
const dateTime = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
});

function readableError(error: { message: string; code?: string }) {
  const message = error?.message || 'Không thể kết nối. Vui lòng thử lại.';
  if (error?.code === 'PGRST205' || error?.code === 'PGRST202' || message.includes('schema cache')) {
    return 'Phòng chat đang được thiết lập. Vui lòng quay lại sau.';
  }
  if (message.includes('Anonymous sign-ins are disabled')) {
    return 'Chức năng gửi tin đang được thiết lập. Vui lòng quay lại sau.';
  }
  return message;
}

async function ensureSession(client: SupabaseClient) {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (data.session) return data.session.user.id;
  const signedIn = await client.auth.signInAnonymously();
  if (signedIn.error) throw signedIn.error;
  if (!signedIn.data.user) throw new Error('Không thể kết nối. Vui lòng thử lại.');
  return signedIn.data.user.id;
}

export function CommunityChat({ url, publishableKey }: { url: string; publishableKey: string }) {
  const client = useMemo(
    () => url && publishableKey ? createClient(url, publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }) : null,
    [url, publishableKey],
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [draft, setDraft] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [olderAvailable, setOlderAvailable] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [connection, setConnection] = useState<Connection>('connecting');
  const [notice, setNotice] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  useEffect(() => {
    try { setDisplayName(localStorage.getItem(NAME_KEY) ?? ''); } catch { /* Storage may be disabled. */ }
  }, []);

  useEffect(() => {
    if (!client) { setLoading(false); setConnection('offline'); return; }
    let cancelled = false;
    client.auth.getSession().then(({ data }) => { if (!cancelled) setUserId(data.session?.user.id ?? null); });
    client.from('chat_messages').select('id, author_id, display_name, body, created_at')
      .order('id', { ascending: false }).limit(PAGE_SIZE)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setNotice(readableError(error));
        else {
          setMessages(((data ?? []) as ChatMessage[]).reverse());
          setOlderAvailable((data?.length ?? 0) === PAGE_SIZE);
        }
        setLoading(false);
      });
    const channel = client.channel('public-chat-room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, ({ new: row }) => {
        const incoming = row as ChatMessage;
        if (!incoming.id || !incoming.body) return;
        setMessages((current) => current.some((message) => message.id === incoming.id) ? current : [...current, incoming]);
      })
      .subscribe((status) => {
        if (!cancelled) setConnection(status === 'SUBSCRIBED' ? 'connected' : status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' ? 'offline' : 'connecting');
      });
    return () => { cancelled = true; void client.removeChannel(channel); };
  }, [client]);

  useEffect(() => {
    if (shouldScrollRef.current && feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [messages]);

  async function loadOlder() {
    if (!client || loadingOlder || !messages.length) return;
    setLoadingOlder(true);
    const feed = feedRef.current;
    const previousHeight = feed?.scrollHeight ?? 0;
    const { data, error } = await client.from('chat_messages')
      .select('id, author_id, display_name, body, created_at')
      .lt('id', messages[0]!.id).order('id', { ascending: false }).limit(PAGE_SIZE);
    if (error) setNotice(readableError(error));
    else {
      shouldScrollRef.current = false;
      setMessages((current) => [...((data ?? []) as ChatMessage[]).reverse(), ...current]);
      setOlderAvailable((data?.length ?? 0) === PAGE_SIZE);
      requestAnimationFrame(() => { if (feed) feed.scrollTop = feed.scrollHeight - previousHeight + feed.scrollTop; });
    }
    setLoadingOlder(false);
  }

  async function sendMessage() {
    if (!client || sending) return;
    const name = displayName.trim();
    const body = draft.trim();
    if (name.length < 2 || name.length > 24) { setNotice('Tên hiển thị cần từ 2 đến 24 ký tự.'); return; }
    if (!body || body.length > 500) { setNotice('Tin nhắn cần từ 1 đến 500 ký tự.'); return; }
    setSending(true);
    setNotice('');
    try {
      const id = await ensureSession(client);
      setUserId(id);
      const { data, error } = await client.rpc('send_chat_message', { p_display_name: name, p_body: body });
      if (error) throw error;
      try { localStorage.setItem(NAME_KEY, name); } catch { /* Storage may be disabled. */ }
      setDraft('');
      shouldScrollRef.current = true;
      const sent = data as ChatMessage;
      setMessages((current) => current.some((message) => message.id === sent.id) ? current : [...current, sent]);
    } catch (error) {
      setNotice(readableError(error as { message: string; code?: string }));
    } finally {
      setSending(false);
    }
  }

  async function reportMessage(id: number) {
    if (!client || reportingId !== null) return;
    setReportingId(id);
    setNotice('');
    try {
      await ensureSession(client);
      const { error } = await client.rpc('report_chat_message', { p_message_id: id });
      if (error) throw error;
      setNotice('Đã gửi báo cáo. Cảm ơn bạn đã giúp giữ phòng chat tích cực.');
    } catch (error) {
      setNotice(readableError(error as { message: string; code?: string }));
    } finally {
      setReportingId(null);
    }
  }

  return (
    <div className="community-chat">
      <div className="community-chat-header">
        <div><span className="community-chat-icon"><Icon name="grid" size={21} /></span><div><strong>Phòng chat chung</strong><small>Tin nhắn được lưu để mọi người cùng theo dõi</small></div></div>
        <span className={`community-status community-status-${connection}`}><i />{connection === 'connected' ? 'Trực tuyến' : connection === 'connecting' ? 'Đang kết nối' : 'Mất kết nối'}</span>
      </div>

      <div className="community-feed" ref={feedRef} role="log" aria-label="Tin nhắn phòng chat" aria-live="polite" onScroll={(event) => {
        const el = event.currentTarget;
        shouldScrollRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
      }}>
        {olderAvailable && <button className="community-load-older" type="button" onClick={loadOlder} disabled={loadingOlder}>{loadingOlder ? 'Đang tải...' : 'Xem tin nhắn cũ hơn'}</button>}
        {loading ? <p className="community-empty">Đang tải tin nhắn...</p> : messages.length === 0 ? <div className="community-empty"><Icon name="book" size={28} /><strong>Chưa có tin nhắn nào</strong><span>Hãy bắt đầu cuộc trò chuyện đầu tiên.</span></div> : messages.map((message) => {
          const mine = message.author_id === userId;
          return <article key={message.id} className={`community-message ${mine ? 'community-message-mine' : ''}`}>
            <div className="community-message-meta"><strong>{message.display_name}</strong><time dateTime={message.created_at}>{dateTime.format(new Date(message.created_at))}</time></div>
            <p>{message.body}</p>
            {!mine && <button type="button" onClick={() => reportMessage(message.id)} disabled={reportingId === message.id} aria-label={`Báo cáo tin nhắn của ${message.display_name}`}>Báo cáo</button>}
          </article>;
        })}
      </div>

      <form className="community-compose" onSubmit={(event) => { event.preventDefault(); void sendMessage(); }}>
        <label htmlFor="chat-display-name">Tên hiển thị</label>
        <input id="chat-display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={24} placeholder="Tên của bạn" autoComplete="nickname" />
        <label htmlFor="chat-message">Tin nhắn</label>
        <textarea id="chat-message" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void sendMessage(); }
        }} maxLength={500} rows={3} placeholder="Chia sẻ câu hỏi, kinh nghiệm ôn thi..." />
        <div className="community-compose-footer"><span>{draft.length}/500 ký tự</span><button className="btn btn-primary" type="submit" disabled={!client || sending || !draft.trim()}>{sending ? 'Đang gửi...' : 'Gửi tin nhắn'} <Icon name="arrow-right" size={18} /></button></div>
        {notice && <p className="community-notice" role="status">{notice}</p>}
      </form>
    </div>
  );
}
