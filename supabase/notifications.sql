create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  title text not null,
  message text not null,
  type text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_email_created_at_idx
  on public.notifications (user_email, created_at desc);

