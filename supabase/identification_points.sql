-- Ho-cha identification system + monthly Ho-point ranking
-- Run this after schema.sql / db_indexes.sql in Supabase SQL Editor.

create table if not exists public.identification_suggestions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  suggested_species_name text not null,
  memo text,
  is_selected boolean not null default false,
  created_at timestamptz not null default now(),
  unique (post_id, user_id, suggested_species_name)
);

create table if not exists public.identification_votes (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.identification_suggestions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (suggestion_id, user_id)
);

create index if not exists idx_identification_suggestions_post_id on public.identification_suggestions(post_id);
create index if not exists idx_identification_suggestions_user_id on public.identification_suggestions(user_id);
create index if not exists idx_identification_suggestions_selected on public.identification_suggestions(is_selected);
create index if not exists idx_identification_votes_suggestion_id on public.identification_votes(suggestion_id);
create index if not exists idx_identification_votes_user_id on public.identification_votes(user_id);

alter table public.identification_suggestions enable row level security;
alter table public.identification_votes enable row level security;

drop policy if exists "identification suggestions are readable" on public.identification_suggestions;
create policy "identification suggestions are readable"
on public.identification_suggestions for select
using (true);

drop policy if exists "authenticated users can create suggestions" on public.identification_suggestions;
create policy "authenticated users can create suggestions"
on public.identification_suggestions for insert
with check (auth.role() = 'authenticated' and auth.uid() = user_id);

drop policy if exists "authors can select final suggestion" on public.identification_suggestions;
create policy "authors can select final suggestion"
on public.identification_suggestions for update
using (
  exists (
    select 1 from public.posts p
    where p.id = identification_suggestions.post_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.posts p
    where p.id = identification_suggestions.post_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "identification votes are readable" on public.identification_votes;
create policy "identification votes are readable"
on public.identification_votes for select
using (true);

drop policy if exists "authenticated users can vote" on public.identification_votes;
create policy "authenticated users can vote"
on public.identification_votes for insert
with check (auth.role() = 'authenticated' and auth.uid() = user_id);

drop policy if exists "users can remove own votes" on public.identification_votes;
create policy "users can remove own votes"
on public.identification_votes for delete
using (auth.uid() = user_id);

create or replace view public.monthly_ho_point_rankings as
with post_base as (
  select
    p.id,
    p.user_id,
    to_char(p.created_at, 'YYYY-MM') as month_key,
    coalesce(nullif(trim(p.species_name), ''), '미동정 생물') as species_name,
    (
      5
      + case when p.image_url is not null and p.image_url <> '' then 2 else 0 end
      + case when p.latitude is not null and p.longitude is not null then 3 else 0 end
      + case when p.water_temp is not null or p.wave_height is not null or p.wind_speed is not null or p.salinity is not null then 2 else 0 end
      + case when length(coalesce(p.caption, '')) >= 20 then 2 else 0 end
    ) as post_points
  from public.posts p
  where p.user_id is not null
),
post_points as (
  select
    user_id,
    month_key,
    sum(post_points)::int as post_points,
    count(*)::int as post_count,
    count(distinct species_name)::int as species_count,
    (count(distinct species_name) * 20)::int as diversity_points
  from post_base
  group by user_id, month_key
),
ident_points as (
  select
    s.user_id,
    to_char(s.created_at, 'YYYY-MM') as month_key,
    (count(*) * 3 + count(*) filter (where s.is_selected) * 25)::int as identification_points,
    count(*)::int as suggestion_count,
    count(*) filter (where s.is_selected)::int as selected_suggestion_count
  from public.identification_suggestions s
  where s.user_id is not null
  group by s.user_id, to_char(s.created_at, 'YYYY-MM')
),
all_users as (
  select user_id, month_key from post_points
  union
  select user_id, month_key from ident_points
)
select
  au.user_id,
  au.month_key,
  coalesce(pr.nickname, 'Ho-cha 사용자') as nickname,
  pr.avatar_url,
  coalesce(pp.post_points, 0) as post_points,
  coalesce(pp.diversity_points, 0) as diversity_points,
  coalesce(ip.identification_points, 0) as identification_points,
  (coalesce(pp.post_points, 0) + coalesce(pp.diversity_points, 0) + coalesce(ip.identification_points, 0)) as total_points,
  coalesce(pp.post_count, 0) as post_count,
  coalesce(pp.species_count, 0) as species_count,
  coalesce(ip.suggestion_count, 0) as suggestion_count,
  coalesce(ip.selected_suggestion_count, 0) as selected_suggestion_count
from all_users au
left join post_points pp on pp.user_id = au.user_id and pp.month_key = au.month_key
left join ident_points ip on ip.user_id = au.user_id and ip.month_key = au.month_key
left join public.profiles pr on pr.id = au.user_id;
