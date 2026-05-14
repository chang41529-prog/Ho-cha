# Ho-cha

연안 생물 기록과 커뮤니티를 위한 Next.js + Supabase 웹 MVP입니다.

## 이번 버전 기능

- 이메일 회원가입/로그인
- 로그인 상태 유지
- Supabase Storage 사진 업로드
- Supabase `posts` 테이블 게시글 저장
- 피드 자동 불러오기
- 실제 게시글 댓글 작성/조회
- 샘플 게시글 표시

## 필수 환경변수

Vercel Project Settings → Environment Variables에 아래 값을 넣어야 합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://wpunchrvcbmwmwhhtjby.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxx
```

## Supabase에서 필요한 설정

1. SQL Editor에서 `supabase/schema.sql` 실행
2. Storage bucket 생성: `post-images`
3. Storage policy 추가
   - SELECT: `bucket_id = 'post-images' AND true`
   - INSERT: `bucket_id = 'post-images' AND auth.role() = 'authenticated'`

## GitHub 업데이트 방법

압축을 푼 뒤 안의 파일 전체를 기존 GitHub 저장소에 업로드해서 덮어씁니다.
Commit changes 후 Vercel이 자동으로 재배포합니다.
