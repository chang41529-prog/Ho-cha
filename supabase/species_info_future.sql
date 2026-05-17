-- Ho-cha 생물 정보 시스템 확장용 예시 SQL
-- 현재 ZIP 버전은 프론트엔드 내 기본 데이터로 동작합니다.
-- 운영 단계에서 공식 자료 검수 후 아래 구조로 species_master를 분리하는 것을 권장합니다.

create table if not exists species_master (
  id uuid default gen_random_uuid() primary key,
  standard_name text not null unique,
  scientific_name text,
  group_name text,
  category text,
  aliases text[] default '{}',
  protected_status text,
  closed_season text,
  min_size text,
  seasonal_months text,
  caution_text text,
  rarity_level text,
  source_note text,
  updated_at timestamp with time zone default now()
);

alter table species_master enable row level security;

drop policy if exists "Species info is viewable by everyone" on species_master;
create policy "Species info is viewable by everyone"
on species_master for select
using (true);
