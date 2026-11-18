-- Safe to run again in the Supabase SQL Editor after creating the project.
-- Visitors can read messages. Only authenticated anonymous sessions may send or report.

create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  author_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 24),
  body text not null check (char_length(body) between 1 and 500),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_recent_idx on public.chat_messages (created_at desc, id desc);
create index if not exists chat_messages_author_recent_idx on public.chat_messages (author_id, created_at desc);

alter table public.chat_messages enable row level security;
revoke all on public.chat_messages from anon, authenticated;
grant select on public.chat_messages to anon, authenticated;

drop policy if exists "Anyone can read visible chat messages" on public.chat_messages;
create policy "Anyone can read visible chat messages"
  on public.chat_messages for select to anon, authenticated
  using (is_hidden = false);

create table if not exists public.chat_reports (
  id bigint generated always as identity primary key,
  message_id bigint not null references public.chat_messages(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (message_id, reporter_id)
);

alter table public.chat_reports enable row level security;
revoke all on public.chat_reports from anon, authenticated;

create or replace function public.send_chat_message(p_display_name text, p_body text)
returns public.chat_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_author uuid := auth.uid();
  v_name text := btrim(p_display_name);
  v_body text := btrim(p_body);
  v_message public.chat_messages;
begin
  if v_author is null then
    raise exception 'Vui lòng kết nối lại rồi gửi tin nhắn.';
  end if;
  if char_length(v_name) not between 2 and 24 then
    raise exception 'Tên hiển thị cần từ 2 đến 24 ký tự.';
  end if;
  if char_length(v_body) not between 1 and 500 then
    raise exception 'Tin nhắn cần từ 1 đến 500 ký tự.';
  end if;

  -- Serialize sends from one browser identity so parallel requests cannot skip the cooldown.
  perform pg_advisory_xact_lock(hashtextextended(v_author::text, 0));
  if exists (
    select 1 from public.chat_messages
    where author_id = v_author and created_at > now() - interval '8 seconds'
  ) then
    raise exception 'Vui lòng chờ 8 giây trước khi gửi tiếp.';
  end if;
  if (
    select count(*) from public.chat_messages
    where author_id = v_author and created_at > now() - interval '1 hour'
  ) >= 40 then
    raise exception 'Bạn đã gửi quá nhiều tin trong một giờ. Hãy quay lại sau.';
  end if;

  insert into public.chat_messages (author_id, display_name, body)
  values (v_author, v_name, v_body)
  returning * into v_message;
  return v_message;
end;
$$;

revoke all on function public.send_chat_message(text, text) from public, anon;
grant execute on function public.send_chat_message(text, text) to authenticated;

create or replace function public.report_chat_message(p_message_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Vui lòng kết nối lại rồi báo cáo tin nhắn.';
  end if;
  if not exists (select 1 from public.chat_messages where id = p_message_id and is_hidden = false) then
    raise exception 'Tin nhắn không còn hiển thị.';
  end if;
  insert into public.chat_reports (message_id, reporter_id)
  values (p_message_id, auth.uid())
  on conflict (message_id, reporter_id) do nothing;
end;
$$;

revoke all on function public.report_chat_message(bigint) from public, anon;
grant execute on function public.report_chat_message(bigint) to authenticated;

-- Stream new messages to connected visitors.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end;
$$;
