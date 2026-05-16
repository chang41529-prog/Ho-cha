"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Heart, MessageCircle, Trash2, MapPin, BookOpen, Map as MapIcon, Trophy, Upload, Navigation, LogOut, UserPlus, LogIn, X, Search } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Post = {
  id: string;
  user_id: string | null;
  species_name: string;
  category?: string | null;
  caption?: string | null;
  image_url?: string | null;
  region?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
  profiles?: { nickname?: string | null; avatar_url?: string | null } | null;
  likes?: { user_id: string }[];
  comments?: { id: string }[];
  identification_status?: string | null;
  rarity?: string | null;
};

type Profile = { id: string; nickname: string | null; avatar_url?: string | null };

type Comment = { id: string; post_id: string; user_id: string | null; content: string; created_at: string; profiles?: { nickname?: string | null } | null };

type SpeciesMaster = {
  id: string;
  commonName: string;
  scientificName: string;
  category: string;
  group: string;
  aliases: string[];
  rarity: "흔함" | "보통" | "드묾" | "주의";
};

const speciesMaster: SpeciesMaster[] = [
  { id: "sebastes-inermis", commonName: "볼락", scientificName: "Sebastes inermis", category: "물고기", group: "볼락류", aliases: ["볼락류", "볼락", "뽈락", "rockfish"], rarity: "보통" },
  { id: "sebastes-schlegelii", commonName: "조피볼락", scientificName: "Sebastes schlegelii", category: "물고기", group: "볼락류", aliases: ["우럭", "조피볼락", "볼락류", "rockfish"], rarity: "흔함" },
  { id: "pagrus-major", commonName: "참돔", scientificName: "Pagrus major", category: "물고기", group: "돔류", aliases: ["참돔", "도미", "돔류", "돔", "red seabream"], rarity: "보통" },
  { id: "acantho-pagrus", commonName: "감성돔", scientificName: "Acanthopagrus schlegelii", category: "물고기", group: "돔류", aliases: ["감성돔", "감시", "돔류", "도미"], rarity: "보통" },
  { id: "ophiu-hali", commonName: "쥐노래미", scientificName: "Hexagrammos otakii", category: "물고기", group: "노래미류", aliases: ["쥐노래미", "노래미", "노래미류"], rarity: "흔함" },
  { id: "lateolabrax", commonName: "농어", scientificName: "Lateolabrax japonicus", category: "물고기", group: "농어류", aliases: ["농어", "깔따구", "농어류", "sea bass"], rarity: "보통" },
  { id: "paralichthys", commonName: "넙치", scientificName: "Paralichthys olivaceus", category: "물고기", group: "가자미류", aliases: ["넙치", "광어", "가자미류", "flatfish"], rarity: "보통" },
  { id: "konosirus", commonName: "전어", scientificName: "Konosirus punctatus", category: "물고기", group: "청어류", aliases: ["전어", "청어류"], rarity: "흔함" },
  { id: "sillago", commonName: "보리멸", scientificName: "Sillago japonica", category: "물고기", group: "보리멸류", aliases: ["보리멸", "모래무지", "보리멸류"], rarity: "보통" },
  { id: "mugil", commonName: "숭어", scientificName: "Mugil cephalus", category: "물고기", group: "숭어류", aliases: ["숭어", "가숭어", "숭어류"], rarity: "흔함" },
  { id: "portumnus", commonName: "꽃게", scientificName: "Portunus trituberculatus", category: "갑각류", group: "게류", aliases: ["꽃게", "게", "게류", "갑각류"], rarity: "보통" },
  { id: "octopus", commonName: "문어류", scientificName: "Octopoda", category: "두족류", group: "문어류", aliases: ["문어", "문어류", "두족류"], rarity: "보통" },
  { id: "sepia", commonName: "갑오징어류", scientificName: "Sepiidae", category: "두족류", group: "오징어류", aliases: ["갑오징어", "오징어", "두족류"], rarity: "보통" },
  { id: "haliotis", commonName: "전복류", scientificName: "Haliotis", category: "패류", group: "패류", aliases: ["전복", "전복류", "패류", "조개"], rarity: "주의" },
];

function rarityClass(rarity?: string | null) {
  if (rarity === "흔함") return "bg-slate-100 text-slate-700";
  if (rarity === "보통") return "bg-blue-50 text-blue-700";
  if (rarity === "드묾") return "bg-purple-50 text-purple-700";
  if (rarity === "주의") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}


const samplePosts: Post[] = [
  { id: "sample-1", user_id: null, species_name: "쥐노래미", category: "물고기", caption: "샘플 기록입니다. 로그인 후 실제 기록을 올릴 수 있습니다.", image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80", region: "부산 기장군 대라리", latitude: 35.240, longitude: 129.226, created_at: new Date().toISOString(), profiles: { nickname: "Ho-cha 사용자" }, likes: [], comments: [] },
  { id: "sample-2", user_id: null, species_name: "꽃게", category: "갑각류", caption: "정확한 좌표는 공개하지 않고 지역명만 표시됩니다.", image_url: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=900&q=80", region: "전남 여수시 돌산읍", latitude: 34.708, longitude: 127.765, created_at: new Date().toISOString(), profiles: { nickname: "연안기록자" }, likes: [], comments: [] }
];

const fmt = (date?: string) => {
  if (!date) return "방금 전";
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
};

export default function Home() {
  const [tab, setTab] = useState("feed");
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [query, setQuery] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({ species: "", category: "물고기", region: "", caption: "", latitude: "", longitude: "" });
  const [speciesQuery, setSpeciesQuery] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesMaster | null>(null);
  const [identificationMode, setIdentificationMode] = useState<"standard" | "request">("standard");
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setSessionUser(data.user);
      if (data.user) loadProfile(data.user.id);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id); else setProfile(null);
    });
    fetchPosts();
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    if (!supabase) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    setProfile(data as Profile | null);
  }

  async function fetchPosts() {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(nickname, avatar_url), likes(user_id), comments(id)")
      .order("created_at", { ascending: false });
    if (!error && data) setPosts(data as Post[]);
  }

  async function signUp() {
    if (!supabase) return alert("Supabase 환경변수를 확인해주세요.");
    const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
    if (error) return alert(error.message);
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, nickname: nickname || "Ho-cha 사용자" });
      alert("회원가입 완료. 로그인 상태를 확인해주세요.");
      setAuthMode(null);
    }
  }

  async function signIn() {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) return alert(error.message);
    setAuthMode(null);
  }

  async function signOut() { if (supabase) await supabase.auth.signOut(); }

  function chooseFile(file?: File) {
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function getLocation() {
    if (!navigator.geolocation) return alert("이 브라우저에서는 위치 기능을 지원하지 않습니다.");
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, latitude: String(pos.coords.latitude), longitude: String(pos.coords.longitude), region: f.region || "현재 위치 기반 기록" })),
      () => alert("위치 권한이 거부되었거나 위치를 가져올 수 없습니다."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function uploadPost() {
    if (!supabase || !sessionUser) return alert("로그인이 필요합니다.");
    if (!form.species.trim() && !speciesQuery.trim()) return alert("생물명을 입력하거나 동정 요청으로 저장해주세요.");
    if (!form.region.trim()) return alert("공개 지역명을 입력해주세요.");
    if (!selectedFile) return alert("사진을 선택해주세요.");
    setUploading(true);
    try {
      const ext = selectedFile.name.split(".").pop() || "jpg";
      const path = `${sessionUser.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("post-images").upload(path, selectedFile, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage.from("post-images").getPublicUrl(path);
      const { error } = await supabase.from("posts").insert({
        user_id: sessionUser.id,
        species_name: identificationMode === "standard" ? form.species.trim() : `동정 요청: ${speciesQuery.trim() || form.species.trim() || "미동정 생물"}`,
        category: form.category,
        caption: identificationMode === "request" ? `[동정 요청] ${form.caption.trim()}`.trim() : form.caption.trim(),
        image_url: publicUrl.publicUrl,
        region: form.region.trim(),
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null
      });
      if (error) throw error;
      setForm({ species: "", category: "물고기", region: "", caption: "", latitude: "", longitude: "" });
      setSpeciesQuery(""); setSelectedSpecies(null); setIdentificationMode("standard");
      setSelectedFile(null); setPreview(""); setTab("feed"); await fetchPosts();
    } catch (e: any) { alert(e.message || "업로드 실패"); } finally { setUploading(false); }
  }

  async function toggleLike(post: Post) {
    if (!supabase || !sessionUser) return alert("로그인이 필요합니다.");
    const liked = post.likes?.some((l) => l.user_id === sessionUser.id);
    if (liked) await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", sessionUser.id);
    else await supabase.from("likes").insert({ post_id: post.id, user_id: sessionUser.id });
    fetchPosts();
  }

  async function loadComments(postId: string) {
    if (!supabase) return;
    const { data } = await supabase.from("comments").select("*, profiles(nickname)").eq("post_id", postId).order("created_at", { ascending: true });
    setComments((c) => ({ ...c, [postId]: (data || []) as Comment[] }));
    setOpenComments(openComments === postId ? null : postId);
  }

  async function addComment(postId: string) {
    if (!supabase || !sessionUser) return alert("로그인이 필요합니다.");
    if (!commentText.trim()) return;
    const { error } = await supabase.from("comments").insert({ post_id: postId, user_id: sessionUser.id, content: commentText.trim() });
    if (error) return alert(error.message);
    setCommentText(""); await loadComments(postId); await fetchPosts();
  }

  async function deletePost(post: Post) {
    if (!supabase || !sessionUser || post.user_id !== sessionUser.id) return;
    if (!confirm("게시글을 삭제할까요?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) return alert(error.message);
    await fetchPosts();
  }

  const filteredPosts = useMemo(() => posts.filter(p => `${p.species_name} ${p.region} ${p.caption || ""}`.toLowerCase().includes(query.toLowerCase())), [posts, query]);
  const myPosts = useMemo(() => posts.filter(p => p.user_id === sessionUser?.id), [posts, sessionUser]);
  const dogam = useMemo(() => {
    const map = new globalThis.Map<string, { name: string; count: number; regions: Set<string>; latest?: string; image?: string }>();
    posts.filter(p => !p.id.startsWith("sample")).forEach(p => {
      const key = p.species_name.trim(); if (!key) return;
      const item = map.get(key) || { name: key, count: 0, regions: new Set<string>(), latest: p.created_at, image: p.image_url || undefined };
      item.count += 1; if (p.region) item.regions.add(p.region); if (!item.latest || (p.created_at && p.created_at > item.latest)) item.latest = p.created_at; if (!item.image && p.image_url) item.image = p.image_url;
      map.set(key, item);
    });
    return Array.from(map.values()).sort((a,b)=>b.count-a.count);
  }, [posts]);
  const mapPosts = posts.filter(p => p.latitude && p.longitude);
  const mapCenter = mapPosts[0] || { latitude: 35.1796, longitude: 129.0756 } as any;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapCenter.longitude)-0.05}%2C${Number(mapCenter.latitude)-0.05}%2C${Number(mapCenter.longitude)+0.05}%2C${Number(mapCenter.latitude)+0.05}&layer=mapnik&marker=${mapCenter.latitude}%2C${mapCenter.longitude}`;
  const speciesCandidates = useMemo(() => {
    const q = speciesQuery.trim().toLowerCase();
    if (!q) return speciesMaster.slice(0, 6);
    return speciesMaster.filter(s => [s.commonName, s.scientificName, s.group, ...s.aliases].some(v => v.toLowerCase().includes(q))).slice(0, 8);
  }, [speciesQuery]);

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button onClick={()=>setTab("feed")} className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-xl">🐟</div><div className="text-left"><b className="text-2xl">Ho-cha</b><p className="text-xs text-slate-500">연안의 모든 기록, 우리의 바다</p></div></button>
        <nav className="hidden gap-2 md:flex">
          {[ ["feed","피드"],["upload","기록"],["dogam","도감"],["map","지도"],["profile","프로필"] ].map(([k,l])=><Button key={k} variant={tab===k?"default":"ghost"} size="sm" onClick={()=>setTab(k)}>{l}</Button>)}
        </nav>
        <div className="flex gap-2">{sessionUser ? <><span className="hidden text-sm font-bold md:block">{profile?.nickname || sessionUser.email}</span><Button variant="outline" size="sm" onClick={signOut}><LogOut className="mr-1 h-4 w-4"/>로그아웃</Button></> : <><Button variant="outline" size="sm" onClick={()=>setAuthMode("login")}><LogIn className="mr-1 h-4 w-4"/>로그인</Button><Button size="sm" onClick={()=>setAuthMode("signup")}><UserPlus className="mr-1 h-4 w-4"/>회원가입</Button></>}</div>
      </div>
      <div className="grid grid-cols-5 gap-1 border-t bg-white px-2 py-2 md:hidden">{[["feed","피드"],["upload","기록"],["dogam","도감"],["map","지도"],["profile","내정보"]].map(([k,l])=><button key={k} onClick={()=>setTab(k)} className={`rounded-xl py-2 text-xs font-bold ${tab===k?'bg-blue-50 text-blue-600':'text-slate-500'}`}>{l}</button>)}</div>
    </header>

    <main className="mx-auto max-w-6xl px-4 py-6">
      {!isSupabaseConfigured && <div className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Supabase 환경변수가 없어 샘플 모드로 표시됩니다.</div>}

      {tab === "feed" && <section><div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h1 className="text-3xl font-black">실시간 피드</h1><p className="text-sm text-slate-500">시간 옆에는 공개 지역명만 표시됩니다.</p></div><div className="relative md:w-80"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><Input className="pl-9" placeholder="생물명, 지역 검색" value={query} onChange={e=>setQuery(e.target.value)}/></div></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredPosts.map(p => <PostCard key={p.id} post={p} userId={sessionUser?.id} onLike={()=>toggleLike(p)} onComments={()=>loadComments(p.id)} onDelete={()=>deletePost(p)} isOpen={openComments===p.id} comments={comments[p.id] || []} commentText={commentText} setCommentText={setCommentText} addComment={()=>addComment(p.id)}/>)}</div></section>}

      {tab === "upload" && <section className="mx-auto max-w-3xl"><Card><CardContent className="space-y-4"><h1 className="text-3xl font-black">새 기록 올리기</h1><div onClick={()=>fileRef.current?.click()} className="grid min-h-52 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center hover:bg-blue-50">{preview ? <img src={preview} className="max-h-80 rounded-xl object-contain"/> : <div><Camera className="mx-auto mb-3 h-10 w-10 text-blue-500"/><b>사진 영역을 눌러 선택</b><p className="mt-1 text-sm text-slate-500">모바일에서는 카메라 또는 앨범 선택</p></div>}<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>chooseFile(e.target.files?.[0])}/></div><div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">생물명 검색·동정</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">이름을 정확히 몰라도 “돔류”, “볼락류”, “게류”처럼 검색하거나 동정 요청으로 저장할 수 있습니다.</p>
                    </div>
                    {selectedSpecies && <span className={`rounded-full px-2 py-1 text-xs font-bold ${rarityClass(selectedSpecies.rarity)}`}>{selectedSpecies.rarity}</span>}
                  </div>
                  <Input placeholder="예: 볼락류, 돔류, 감성돔, 우럭" value={speciesQuery} onChange={e=>{setSpeciesQuery(e.target.value); setIdentificationMode("standard");}} />
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {speciesCandidates.map(sp => (
                      <button key={sp.id} type="button" onClick={() => { setSelectedSpecies(sp); setIdentificationMode("standard"); setForm({...form, species: sp.commonName, category: sp.category}); }} className={`rounded-xl border p-3 text-left transition hover:border-blue-400 hover:bg-blue-50 ${selectedSpecies?.id === sp.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50"}`}>
                        <div className="flex items-center justify-between gap-2"><b>{sp.commonName}</b><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${rarityClass(sp.rarity)}`}>{sp.rarity}</span></div>
                        <p className="mt-1 text-xs text-slate-500">{sp.group} · {sp.scientificName}</p>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button type="button" variant={identificationMode === "request" ? "default" : "outline"} size="sm" onClick={() => { setIdentificationMode("request"); setSelectedSpecies(null); setForm({...form, species: speciesQuery || "미동정 생물", category: form.category}); }}>이름을 모르겠어요 · 동정 요청</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => alert("AI 사진 동정은 다음 단계에서 연결할 예정입니다. 현재는 검색 후보와 동정 요청으로 기록을 보존합니다.")}>AI 후보 추천 준비중</Button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2"><Input placeholder="선택된 표준명 또는 임시명" value={form.species} onChange={e=>{setForm({...form,species:e.target.value}); setSelectedSpecies(null);}}/><select className="rounded-xl border border-slate-200 px-3" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>물고기</option><option>갑각류</option><option>패류</option><option>두족류</option><option>기타</option></select></div><Input placeholder="공개 지역명 예: 부산 기장군 대라리" value={form.region} onChange={e=>setForm({...form,region:e.target.value})}/><div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><Input placeholder="위도" value={form.latitude} onChange={e=>setForm({...form,latitude:e.target.value})}/><Input placeholder="경도" value={form.longitude} onChange={e=>setForm({...form,longitude:e.target.value})}/><Button variant="outline" onClick={getLocation}><Navigation className="mr-1 h-4 w-4"/>현재 위치</Button></div>{form.latitude && form.longitude && <iframe title="selected map" className="h-64 w-full rounded-2xl border" src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(form.longitude)-0.01}%2C${Number(form.latitude)-0.01}%2C${Number(form.longitude)+0.01}%2C${Number(form.latitude)+0.01}&layer=mapnik&marker=${form.latitude}%2C${form.longitude}`}/>}<Input placeholder="설명" value={form.caption} onChange={e=>setForm({...form,caption:e.target.value})}/><Button onClick={uploadPost} disabled={uploading} className="h-12"><Upload className="mr-2 h-5 w-5"/>{uploading?"업로드 중":"기록 올리기"}</Button></CardContent></Card></section>}

      {tab === "dogam" && <section><h1 className="text-3xl font-black">연안 도감</h1><p className="mt-1 text-sm text-slate-500">사용자가 올린 게시글을 생물명 기준으로 자동 집계합니다.</p><div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{dogam.length ? dogam.map(d=><Card key={d.name} className="overflow-hidden">{d.image && <img src={d.image} className="h-40 w-full object-cover"/>}<CardContent><div className="flex items-center justify-between"><h2 className="text-xl font-black"><BookOpen className="mr-1 inline h-5 w-5 text-blue-600"/>{d.name}</h2><span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-600">{d.count}건</span></div><p className="mt-3 text-sm text-slate-600">최근 기록: {fmt(d.latest)}</p><p className="mt-2 text-sm text-slate-600">기록 지역: {Array.from(d.regions).slice(0,3).join(", ") || "-"}</p></CardContent></Card>) : <p className="text-slate-500">아직 실제 기록이 없습니다.</p>}</div></section>}

      {tab === "map" && <section><h1 className="text-3xl font-black">지도 피드</h1><p className="mt-1 text-sm text-slate-500">지도는 좌표 기반으로 확인하되, 공개 피드에는 지역명만 표시합니다.</p><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]"><Card className="overflow-hidden"><iframe title="map feed" className="h-[520px] w-full" src={mapSrc}/></Card><div className="space-y-3">{mapPosts.map(p=><Card key={p.id}><CardContent><p className="font-black"><MapPin className="mr-1 inline h-4 w-4 text-blue-600"/>{p.species_name}</p><p className="text-sm text-slate-600">{p.region || "지역명 없음"}</p><p className="mt-1 text-xs text-slate-400">좌표: {Number(p.latitude).toFixed(5)}, {Number(p.longitude).toFixed(5)}</p></CardContent></Card>)}</div></div></section>}

      {tab === "profile" && <section><h1 className="text-3xl font-black">내 프로필</h1>{sessionUser ? <div className="mt-5 grid gap-5 md:grid-cols-[280px_1fr]"><Card><CardContent><div className="text-5xl">🐟</div><h2 className="mt-3 text-xl font-black">{profile?.nickname || "Ho-cha 사용자"}</h2><p className="text-sm text-slate-500">{sessionUser.email}</p><div className="mt-5 grid grid-cols-2 gap-3 text-center"><div className="rounded-xl bg-blue-50 p-3"><b className="text-2xl text-blue-600">{myPosts.length}</b><p className="text-xs">내 기록</p></div><div className="rounded-xl bg-blue-50 p-3"><b className="text-2xl text-blue-600">{new Set(myPosts.map(p=>p.species_name)).size}</b><p className="text-xs">기록 종</p></div></div></CardContent></Card><div className="grid gap-4 md:grid-cols-2">{myPosts.map(p=><PostCard key={p.id} post={p} userId={sessionUser.id} onLike={()=>toggleLike(p)} onComments={()=>loadComments(p.id)} onDelete={()=>deletePost(p)} isOpen={false} comments={[]} commentText="" setCommentText={()=>{}} addComment={()=>{}} />)}</div></div> : <Card className="mt-5"><CardContent><p>로그인이 필요합니다.</p></CardContent></Card>}</section>}
    </main>

    {authMode && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"><Card className="w-full max-w-md"><CardContent className="space-y-3"><div className="flex items-center justify-between"><h2 className="text-2xl font-black">{authMode === "login" ? "로그인" : "회원가입"}</h2><button onClick={()=>setAuthMode(null)}><X/></button></div>{authMode === "signup" && <Input placeholder="닉네임" value={nickname} onChange={e=>setNickname(e.target.value)}/>}<Input type="email" placeholder="이메일" value={authEmail} onChange={e=>setAuthEmail(e.target.value)}/><Input type="password" placeholder="비밀번호" value={authPassword} onChange={e=>setAuthPassword(e.target.value)}/><Button className="w-full" onClick={authMode === "login" ? signIn : signUp}>{authMode === "login" ? "로그인" : "회원가입"}</Button></CardContent></Card></div>}
  </div>;
}

function PostCard({ post, userId, onLike, onComments, onDelete, isOpen, comments, commentText, setCommentText, addComment }: any) {
  const liked = post.likes?.some((l:any) => l.user_id === userId);
  const canDelete = userId && post.user_id === userId;
  return <Card className="overflow-hidden"><div className="flex items-center justify-between p-4"><div><p className="font-black">{post.profiles?.nickname || "Ho-cha 사용자"}</p><p className="text-xs text-slate-500">{fmt(post.created_at)} · {post.region || "지역 미입력"}</p></div>{canDelete && <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="h-4 w-4"/></Button>}</div>{post.image_url && <img src={post.image_url} className="h-64 w-full object-cover"/>}<CardContent><div className="mb-2 flex items-center gap-2"><h2 className="text-xl font-black">{post.species_name}</h2>{post.category && <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">{post.category}</span>}{String(post.species_name).startsWith("동정 요청") && <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">동정 요청</span>}</div>{post.caption && <p className="mb-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.caption}</p>}<div className="flex items-center gap-4 text-sm"><button onClick={onLike} className={`flex items-center gap-1 font-bold ${liked ? "text-red-500" : "text-slate-500"}`}><Heart className={`h-5 w-5 ${liked ? "fill-red-500" : ""}`}/>{post.likes?.length || 0}</button><button onClick={onComments} className="flex items-center gap-1 font-bold text-slate-500"><MessageCircle className="h-5 w-5"/>댓글 {post.comments?.length || 0}</button></div>{isOpen && <div className="mt-4 border-t pt-4"><div className="space-y-2">{comments.map((c:any)=><div key={c.id} className="rounded-xl bg-slate-50 p-3 text-sm"><b>{c.profiles?.nickname || "사용자"}</b><p>{c.content}</p></div>)}</div><div className="mt-3 flex gap-2"><Input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="댓글 입력"/><Button onClick={addComment}>등록</Button></div></div>}</CardContent></Card>;
}
