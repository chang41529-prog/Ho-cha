-- Ho-cha performance index patch
-- Run this in Supabase SQL Editor if your existing DB was created before this final package.

create index if not exists idx_posts_created_at on posts(created_at desc);
create index if not exists idx_posts_user_id on posts(user_id);
create index if not exists idx_posts_species_name on posts(species_name);
create index if not exists idx_posts_region on posts(region);
create index if not exists idx_comments_post_id on comments(post_id);
create index if not exists idx_comments_created_at on comments(created_at asc);
create index if not exists idx_likes_post_id on likes(post_id);
create index if not exists idx_likes_user_id on likes(user_id);
