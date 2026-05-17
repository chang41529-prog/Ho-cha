import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

type PostPageProps = {
  params: { id: string };
};

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { persistSession: false } });
}

function formatDate(value?: string) {
  if (!value) return "기록 시간 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "기록 시간 없음";
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-900">
        <div className="mx-auto max-w-3xl">
          <Card className="rounded-3xl border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <p className="text-lg font-black text-amber-800">Supabase 환경변수가 필요합니다.</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 Vercel 환경변수에 등록한 뒤 다시 확인해주세요.
              </p>
              <Link href="/" className="mt-5 inline-block rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">홈으로 돌아가기</Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select("*, profiles(nickname, avatar_url)")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !post) notFound();

  const [{ count: likesCount }, { count: commentsCount }, commentsResult] = await Promise.all([
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_id", params.id),
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("post_id", params.id),
    supabase
      .from("comments")
      .select("id, content, created_at, profiles(nickname, avatar_url)")
      .eq("post_id", params.id)
      .order("created_at", { ascending: true }),
  ]);

  const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
  const comments = commentsResult.data || [];
  const publicRegion = post.region || "지역 미입력";

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link href="/" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">← Ho-cha 홈</Link>
          <p className="text-xs font-bold text-slate-400">공개 위치는 권역명만 표시됩니다.</p>
        </div>

        <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 p-5">
            <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-blue-50 text-lg">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="프로필" className="h-full w-full object-cover" loading="lazy" /> : "🐟"}
            </div>
            <div>
              <p className="font-black text-slate-900">{profile?.nickname || "Ho-cha 사용자"}</p>
              <p className="text-sm text-slate-500">{formatDate(post.created_at)} · {publicRegion}</p>
            </div>
          </div>

          {post.image_url && (
            <img
              src={post.image_url}
              alt={post.species_name || "Ho-cha 기록 이미지"}
              className="max-h-[70vh] w-full bg-slate-100 object-contain"
              loading="lazy"
            />
          )}

          <CardContent className="p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-black text-slate-900">{post.species_name || "미동정 생물"}</h1>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{post.category || "fish"}</span>
              {post.species_name?.startsWith("동정 요청") && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">동정 요청</span>}
            </div>

            <p className="whitespace-pre-wrap text-base leading-8 text-slate-700">{post.caption || "기록 설명이 없습니다."}</p>

            <div className="mt-5 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4"><span className="font-black text-slate-900">공개 지역</span> · {publicRegion}</div>
              <div className="rounded-2xl bg-slate-50 p-4"><span className="font-black text-slate-900">위치 데이터</span> · {post.latitude && post.longitude ? "비공개 좌표 저장됨" : "권역명만 저장"}</div>
              <div className="rounded-2xl bg-slate-50 p-4"><span className="font-black text-slate-900">좋아요</span> · {likesCount || 0}</div>
              <div className="rounded-2xl bg-slate-50 p-4"><span className="font-black text-slate-900">댓글</span> · {commentsCount || 0}</div>
              {post.water_temp && <div className="rounded-2xl bg-slate-50 p-4"><span className="font-black text-slate-900">수온</span> · {post.water_temp}</div>}
              {post.wave_height && <div className="rounded-2xl bg-slate-50 p-4"><span className="font-black text-slate-900">파고</span> · {post.wave_height}</div>}
              {post.wind_speed && <div className="rounded-2xl bg-slate-50 p-4"><span className="font-black text-slate-900">풍속</span> · {post.wind_speed}</div>}
              {post.salinity && <div className="rounded-2xl bg-slate-50 p-4"><span className="font-black text-slate-900">염분</span> · {post.salinity}</div>}
            </div>
          </CardContent>
        </Card>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900">댓글</h2>
          <div className="mt-4 space-y-3">
            {comments.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">아직 댓글이 없습니다.</p>
            ) : (
              comments.map((comment: any) => {
                const commentProfile = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
                return (
                  <div key={comment.id} className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-blue-50 text-xs">
                        {commentProfile?.avatar_url ? <img src={commentProfile.avatar_url} alt="댓글 프로필" className="h-full w-full object-cover" loading="lazy" /> : "🐟"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{commentProfile?.nickname || "Ho-cha 사용자"}</p>
                        <p className="text-xs text-slate-400">{formatDate(comment.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate-700">{comment.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
