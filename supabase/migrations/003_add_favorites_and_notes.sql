-- Migration: Add is_favorite and notes to translation_history
-- Run in Supabase SQL Editor or via Supabase CLI

alter table public.translation_history 
  add column if not exists is_favorite boolean not null default false,
  add column if not exists notes text not null default '';

-- Index for searching and filtering by favorites
create index if not exists translation_history_user_favorite
  on public.translation_history (user_id, is_favorite);
