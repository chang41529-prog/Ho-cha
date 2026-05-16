create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nickname text,
  avatar_url text,
  bio text,
  favorite_group text,
  featured_badge text,
  created_at timestamp with time zone default now()
);

create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  species_name text not null,
  category text default 'fish',
  caption text,
  image_url text,
  region text,
  latitude double precision,
  longitude double precision,
  water_temp text,
  wave_height text,
  wind_speed text,
  salinity text,
  created_at timestamp with time zone default now()
);

create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(post_id, user_id)
);

create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table reports enable row level security;

create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Posts are viewable by everyone" on posts for select using (true);
create policy "Logged in users can create posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts" on posts for update using (auth.uid() = user_id);
create policy "Users can delete their own posts" on posts for delete using (auth.uid() = user_id);
create policy "Comments are viewable by everyone" on comments for select using (true);
create policy "Logged in users can create comments" on comments for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments" on comments for delete using (auth.uid() = user_id);
create policy "Likes are viewable by everyone" on likes for select using (true);
create policy "Logged in users can like posts" on likes for insert with check (auth.uid() = user_id);
create policy "Users can remove their own likes" on likes for delete using (auth.uid() = user_id);
create policy "Logged in users can report posts" on reports for insert with check (auth.uid() = user_id);
