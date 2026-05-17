# Ho-cha

연안 생물 기록과 커뮤니티를 위한 Next.js + Supabase 웹 MVP입니다.

## 이번 최종 정리 버전의 핵심

- 기존 `posts` 중심 구조 유지
- 메인 피드를 덮어쓰지 않는 추가형 개선
- `/api/environment` 해황·기상 API 라우트 안정화
- `/post/[id]` 게시글 공유용 상세 페이지 추가
- 이미지 `loading="lazy"` 적용
- Supabase DB 인덱스 SQL 추가
- 공개 지역명과 실제 좌표 분리 원칙 유지

## 기술 스택

| 항목 | 사용 |
| --- | --- |
| Frontend | Next.js 14 App Router |
| Backend | Supabase |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| DB | Supabase Postgres |
| Hosting | Vercel |
| 지도 | OpenStreetMap Embed |
| 해황 API | 국립해양조사원 KHOA |
| 기상 API | 기상청 KMA |

## 프로젝트 구조

```text
app/
  api/environment/route.ts
  post/[id]/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  ui/button.tsx
  ui/card.tsx
  ui/input.tsx
lib/
  supabase.ts
  utils.ts
supabase/
  schema.sql
  db_indexes.sql
  environment_cache_future.sql
  profile_customization.sql
  species_info_future.sql
```

## 필수 환경변수

Vercel Project Settings → Environment Variables에 아래 값을 넣어야 합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
KHOA_API_KEY=your_khoa_api_key
KMA_API_KEY=your_kma_api_key
```

주의: API 키는 GitHub 코드에 직접 넣지 않습니다.

## Supabase에서 필요한 설정

1. Supabase SQL Editor에서 `supabase/schema.sql` 실행
2. 이미 DB를 만들어둔 경우에는 `supabase/db_indexes.sql`만 추가 실행 가능
3. Storage bucket 생성: `post-images`
4. Storage policy 추가
   - SELECT: `bucket_id = 'post-images' AND true`
   - INSERT: `bucket_id = 'post-images' AND auth.role() = 'authenticated'`

## 배포 방법

1. 이 폴더 안의 파일 전체를 기존 GitHub 저장소에 업로드해서 덮어씁니다.
2. `package-lock.json`은 기존 내부 npm 주소 문제를 피하기 위해 필요하지 않으면 올리지 않습니다.
3. Commit changes를 누르면 Vercel이 자동으로 재배포합니다.
4. Vercel 환경변수는 Production에 등록되어 있어야 합니다.

## 지도/좌표 기능

- Google Maps API 없이 OpenStreetMap embed 지도를 사용합니다.
- 현재 위치 버튼으로 GPS 좌표를 저장하거나 위도/경도를 직접 입력할 수 있습니다.
- 공개 피드에는 권역명만 표시하고, 정확 좌표는 DB에 저장됩니다.
- 포인트 노출과 남획 유도를 막기 위해 정확 좌표는 공개하지 않는 방향을 유지합니다.

## 해황·기상 API

- 메인 홈의 “오늘의 해황” 카드와 기록 업로드 시 현재 위치 기준 해황·기상 카드가 `/api/environment`를 통해 표시됩니다.
- API 호출 실패 시 사이트가 깨지지 않도록 대체값이 표시됩니다.
- API 라우트에는 `Cache-Control: s-maxage=600, stale-while-revalidate=1800` 헤더가 적용되어 있습니다.
- 더 많은 사용자를 받게 되면 `supabase/environment_cache_future.sql` 기반 서버 캐시로 확장하는 것을 권장합니다.

데이터 출처 표기: 기상 정보 제공: 기상청 · 해양 정보 제공: 국립해양조사원

## 운영 방향

Ho-cha는 “많이 잡기 경쟁”이 아니라 다음 가치를 중심으로 운영하는 것이 좋습니다.

- 다양한 종 기록
- 동정 도움
- 위치 기반 관찰 기록
- 보호종·금어기·금지체장 정보 확인
- 연안 생물 다양성 기록

## 다음 개발 추천 순서

1. `app/page.tsx` 내부 컴포넌트 추가 분리
2. Supabase pagination 적용: `.range(0, 19)` 기반 무한 스크롤
3. `/post/[id]` 상세 페이지와 메인 피드 카드 클릭 동작 연결 고도화
4. 환경 데이터 Supabase 캐시 적용
5. 동정 요청 전용 피드 강화
