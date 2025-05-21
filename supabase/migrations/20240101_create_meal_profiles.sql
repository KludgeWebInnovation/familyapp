-- Migration to create meal_profiles table

create table if not exists public.meal_profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  household_size integer,
  picky_eaters text,
  cooking_days text[],
  goals text[],
  success_vision text,
  diet_type text,
  ingredient_avoid text[],
  exploration_pref text,
  skill_level text,
  weeknight_time integer,
  batch_cooking boolean,
  meals_per_day integer,
  planning_mode text,
  calendar_sync boolean,
  tone text,
  nudges boolean,
  learning_pref boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Function and trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_meal_profiles_updated_at
before update on public.meal_profiles
for each row execute function public.handle_updated_at();

-- Row Level Security policies
alter table public.meal_profiles enable row level security;

create policy "Meal profiles are viewable by owner" on public.meal_profiles
for select using (auth.uid() = user_id);

create policy "Meal profiles are insertable by owner" on public.meal_profiles
for insert with check (auth.uid() = user_id);

create policy "Meal profiles are updatable by owner" on public.meal_profiles
for update using (auth.uid() = user_id);

create policy "Meal profiles are deletable by owner" on public.meal_profiles
for delete using (auth.uid() = user_id);
