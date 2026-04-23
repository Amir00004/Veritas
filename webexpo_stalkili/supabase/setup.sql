-- ============================================
-- EXAMPLE TABLE — Modify this for your project
--
-- How to use:
-- 1. Change the table name and columns to match your PROJECT.md
-- 2. Go to your Supabase dashboard → SQL Editor
-- 3. Paste this SQL and click Run
-- ============================================

-- Create your table
create table if not exists items (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  completed boolean default false,
  user_id uuid references auth.users(id) not null default auth.uid(),
  created_at timestamptz default now()
);

-- Enable Row Level Security (required for Supabase)
alter table items enable row level security;

-- Users can only see their own data
create policy "Users can read own items"
  on items for select
  using (auth.uid() = user_id);

create policy "Users can insert own items"
  on items for insert
  with check (auth.uid() = user_id);

create policy "Users can update own items"
  on items for update
  using (auth.uid() = user_id);

create policy "Users can delete own items"
  on items for delete
  using (auth.uid() = user_id);
