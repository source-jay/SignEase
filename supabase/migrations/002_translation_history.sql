-- Migration: Translation history table
-- Run in Supabase SQL Editor or via Supabase CLI

create table if not exists public.translation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sentence text not null,
  words text[] not null default '{}',
  word_count integer not null default 0,
  duration_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.translation_history enable row level security;

create policy "Users can view own history"
  on public.translation_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own history"
  on public.translation_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own history"
  on public.translation_history for delete
  using (auth.uid() = user_id);

-- Index for fast per-user queries ordered by time
create index if not exists translation_history_user_created
  on public.translation_history (user_id, created_at desc);
