-- Optional future cache table for KHOA/KMA environmental data.
-- Not required for the current version, because /api/environment uses HTTP cache headers.

create table if not exists environment_cache (
  id uuid default gen_random_uuid() primary key,
  lat_bucket numeric not null,
  lon_bucket numeric not null,
  station text,
  payload jsonb not null,
  created_at timestamp with time zone default now(),
  unique(lat_bucket, lon_bucket)
);

alter table environment_cache enable row level security;

drop policy if exists "Environment cache is viewable by everyone" on environment_cache;
create policy "Environment cache is viewable by everyone"
on environment_cache for select
using (true);
