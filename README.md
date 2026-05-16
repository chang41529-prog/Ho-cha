# Ho-cha

연안 생물 기록 커뮤니티 MVP입니다.

## 이번 버전
- 도감 자동 집계
- 지도 피드
- 공개 지역명 표시
- 사진 업로드
- 좋아요 1인 1회
- 댓글 수 표시
- 본인 게시글 삭제
- 프로필/내 기록 보기

## 환경변수
Vercel Environment Variables에 아래 값을 넣어야 합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

## 배포 오류 대응
`package-lock.json`은 포함하지 않습니다. `.npmrc`로 공식 npm registry를 고정했습니다.
