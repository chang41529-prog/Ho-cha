# Ho-cha

연안 생물 기록 커뮤니티 MVP입니다.

## 이번 버전
- 종 검색 기능 추가
- 볼락류, 돔류, 게류 등 그룹명/별칭 검색 가능
- 표준 후보 선택 시 표준국명, 분류군, 학명, 희귀도 표시
- 이름을 모를 경우 `동정 요청`으로 저장 가능
- 향후 AI 사진 동정 기능을 붙이기 위한 자리 마련
- 기존 기능 유지: 사진 업로드, GPS/지도, 공개 지역명, 좋아요 1인 1회, 댓글 수, 게시글 삭제, 프로필, 도감, 지도 피드

## 현재 종 데이터 구조
이번 버전은 별도 DB 마이그레이션 없이 작동하도록 `app/page.tsx` 내부의 `speciesMaster` 배열을 사용합니다.
나중에 실제 서비스가 커지면 `species_master` 테이블로 분리하는 것을 권장합니다.

## 희귀도 기준 초안
- 흔함: 연안에서 기록 빈도가 높고 일반적인 종
- 보통: 특정 계절/지역에서 비교적 자주 기록되는 종
- 드묾: 기록 빈도가 낮거나 특정 해역·계절에 제한적으로 보이는 종
- 주의: 자원관리, 금어기, 금지체장, 보호 필요성 등을 별도로 확인해야 하는 생물군

희귀도는 멸종위기 등급이 아니라 Ho-cha 내부 기록 및 관리 관점의 표시입니다.

## 환경변수
Vercel Environment Variables에 아래 값을 넣어야 합니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

## 배포 오류 대응
`package-lock.json`은 포함하지 않습니다. `.npmrc`로 공식 npm registry를 고정했습니다.
