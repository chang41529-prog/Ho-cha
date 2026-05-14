"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  Camera,
  ChevronRight,
  Compass,
  Droplets,
  Eye,
  Fish,
  Flag,
  Heart,
  Info,
  Leaf,
  LogIn,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Plus,
  Search,
  Shell,
  Thermometer,
  Trophy,
  Upload,
  UserPlus,
  Waves,
  Wind,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const samplePosts = [
  { id: "sample-1", user: "바다소년", species: "쥐노래미", group: "fish", location: "부산 기장", temp: "18.6°C", wave: "0.4 m", caption: "오전에 족대로 잡았어요. 23cm 정도 됩니다.", likes: 24, comments: 5, img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80", tag: "물고기", date: "샘플", avatar: "🐟", isSample: true },
  { id: "sample-2", user: "낚시놀거위", species: "갑오징어", group: "shell", location: "통영 선암읍", temp: "17.8°C", wave: "0.5 m", caption: "방파제 앞에서 잡았습니다. 사이즈 좋은 녀석!", likes: 31, comments: 7, img: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80", tag: "두족류", date: "샘플", avatar: "🦑", isSample: true },
  { id: "sample-3", user: "제주바당", species: "돌돔", group: "fish", location: "제주 서귀포", temp: "20.1°C", wave: "0.6 m", caption: "뜰채로 확인하고 바로 기록했습니다.", likes: 18, comments: 3, img: "https://images.unsplash.com/photo-1517420879524-86d64ac2f339?auto=format&fit=crop&w=900&q=80", tag: "물고기", date: "샘플", avatar: "🌊", isSample: true },
];

const rankings = [
  { rank: 1, name: "바다소년", score: "28종", points: 1280, avatar: "🐟" },
  { rank: 2, name: "제주바당", score: "24종", points: 1120, avatar: "🌊" },
  { rank: 3, name: "낚시놀거위", score: "21종", points: 980, avatar: "🦑" },
  { rank: 4, name: "갯바위킹", score: "19종", points: 870, avatar: "🦀" },
  { rank: 5, name: "행복한낚시", score: "17종", points: 820, avatar: "🐡" },
];

const speciesBook = [
  { name: "쥐노래미", count: 42, season: "봄·가을", icon: Fish, point: "연안 암반·방파제 주변" },
  { name: "꽃게", count: 31, season: "봄·여름", icon: Shell, point: "갯벌·연안 저층" },
  { name: "고둥류", count: 57, season: "연중", icon: Shell, point: "조간대·항만 구조물" },
  { name: "망둑어류", count: 24, season: "여름", icon: Fish, point: "하구·얕은 연안" },
];

type Post = {
  id: string;
  user: string;
  species: string;
  group: string;
  location: string;
  temp?: string;
  wave?: string;
  caption: string;
  likes: number;
  comments: number;
  img: string;
  tag: string;
  date: string;
  avatar: string;
  isSample?: boolean;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id?: string;
};

function formatDate(value?: string) {
  if (!value) return "방금 전";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "방금 전";
  return d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) + " " + d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function mapDbPost(row: any): Post {
  const category = row.category || "fish";
  return {
    id: row.id,
    user: "Ho-cha 사용자",
    species: row.species_name || "미동정 생물",
    group: category,
    location: row.region || "지역 미입력",
    temp: row.water_temp || undefined,
    wave: row.wave_height || undefined,
    caption: row.caption || "새로운 Ho-cha 기록입니다.",
    likes: 0,
    comments: 0,
    img: row.image_url || "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
    tag: category === "shell" ? "패류" : category === "crab" ? "갑각류" : "물고기",
    date: formatDate(row.created_at),
    avatar: category === "shell" ? "🐚" : category === "crab" ? "🦀" : "🐟",
  };
}

function SectionTitle({ title, desc, action }: { title: string; desc?: string; action?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-black text-slate-900 md:text-2xl">{title}</h2>
        {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      </div>
      {action && <button className="hidden items-center gap-1 text-sm font-bold text-blue-600 md:flex">{action} <ChevronRight className="h-4 w-4" /></button>}
    </div>
  );
}

function PostCard({ post, compact = false, onComments }: { post: Post; compact?: boolean; onComments: (post: Post) => void }) {
  return (
    <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3 p-4">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-lg">{post.avatar}</div>
        <div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{post.user}</p><p className="truncate text-xs text-slate-500">{post.date} · {post.location}</p></div>
      </div>
      <img src={post.img} alt={post.species} className={`${compact ? "h-44" : "h-52"} w-full object-cover`} />
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2"><h3 className="font-black text-slate-900">{post.species}</h3><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">{post.tag}</span>{post.isSample && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">샘플</span>}</div>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{post.caption}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">{post.temp && <span className="rounded-full bg-slate-100 px-2 py-1">수온 {post.temp}</span>}{post.wave && <span className="rounded-full bg-slate-100 px-2 py-1">파고 {post.wave}</span>}</div>
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500"><span className="flex items-center gap-1"><Heart className="h-4 w-4" />{post.likes}</span><button onClick={() => onComments(post)} className="flex items-center gap-1 hover:text-blue-600"><MessageCircle className="h-4 w-4" />댓글</button><button className="ml-auto flex items-center gap-1 text-xs text-slate-400"><Flag className="h-3.5 w-3.5" />신고</button></div>
      </div>
    </motion.article>
  );
}

function WeatherCard() {
  return (
    <Card className="rounded-3xl border-0 bg-slate-900/92 text-white shadow-2xl backdrop-blur">
      <CardContent className="p-6">
        <div className="mb-5 flex items-start justify-between"><div><h3 className="text-2xl font-black">오늘의 해황</h3><p className="mt-3 flex items-center gap-1 text-sm text-slate-200"><MapPin className="h-4 w-4" /> 부산 기장군 연안</p></div><p className="text-xs text-slate-300">05.28 14:00 기준</p></div>
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 p-3"><div className="border-b border-r border-white/10 p-3"><p className="mb-2 text-xs text-slate-300">수온</p><p className="flex items-center gap-2 text-2xl font-black"><Thermometer className="h-6 w-6" />18.6°C</p></div><div className="border-b border-white/10 p-3"><p className="mb-2 text-xs text-slate-300">파고</p><p className="flex items-center gap-2 text-2xl font-black"><Waves className="h-6 w-6" />0.4m</p></div><div className="border-r border-white/10 p-3"><p className="mb-2 text-xs text-slate-300">풍속</p><p className="flex items-center gap-2 text-2xl font-black"><Wind className="h-6 w-6" />3.2m/s</p></div><div className="p-3"><p className="mb-2 text-xs text-slate-300">염분</p><p className="flex items-center gap-2 text-2xl font-black"><Droplets className="h-6 w-6" />33.8psu</p></div></div>
        <Button className="mt-4 w-full rounded-xl bg-white/10 py-5 font-bold text-white hover:bg-white/15">자세히 보기 <ChevronRight className="ml-1 h-4 w-4" /></Button>
      </CardContent>
    </Card>
  );
}

export default function HoChaWebMVP() {
  const [tab, setTab] = useState("home");
  const [query, setQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [dbPostsLoaded, setDbPostsLoaded] = useState(false);
  const [form, setForm] = useState({ species: "", location: "", caption: "", category: "fish" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authMessage, setAuthMessage] = useState("");
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const fetchPosts = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      const mapped = data.map(mapDbPost);
      setPosts(mapped.length > 0 ? mapped : samplePosts);
      setDbPostsLoaded(true);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setCurrentUser(session?.user ?? null));
    fetchPosts();
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const filteredPosts = useMemo(() => posts.filter((post) => `${post.species} ${post.location} ${post.caption} ${post.user}`.toLowerCase().includes(query.toLowerCase())), [query, posts]);

  const openAuth = (mode: "login" | "signup") => { setAuthMode(mode); setAuthMessage(""); setAuthOpen(true); };

  const handleAuth = async () => {
    if (!isSupabaseConfigured || !supabase) { setAuthMessage("Supabase 환경변수가 연결되지 않았습니다."); return; }
    if (!email || !password) { setAuthMessage("이메일과 비밀번호를 입력해주세요."); return; }
    if (password.length < 6) { setAuthMessage("비밀번호는 6자 이상이어야 합니다."); return; }
    setAuthMessage("처리 중입니다...");
    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setAuthMessage(error.message); return; }
      const userId = data.user?.id;
      if (userId) await supabase.from("profiles").upsert({ id: userId, nickname: nickname || email.split("@")[0] });
      setAuthMessage("회원가입이 완료되었습니다. 이메일 확인이 필요한 경우 메일함을 확인해주세요.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setAuthMessage(error.message); return; }
      setAuthMessage("로그인되었습니다."); setAuthOpen(false);
    }
  };

  const handleLogout = async () => { if (!supabase) return; await supabase.auth.signOut(); setCurrentUser(null); };

  const handleFileChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadMessage("이미지 파일만 업로드할 수 있습니다."); return; }
    if (file.size > 8 * 1024 * 1024) { setUploadMessage("사진은 8MB 이하로 올려주세요."); return; }
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadMessage("");
  };

  const handleUpload = async () => {
    if (!supabase) { setUploadMessage("Supabase 연결이 필요합니다."); return; }
    if (!currentUser) { setUploadMessage("로그인 후 기록을 올릴 수 있습니다."); openAuth("login"); return; }
    if (!selectedFile) { setUploadMessage("사진을 선택해주세요."); return; }
    if (!form.species.trim() || !form.location.trim()) { setUploadMessage("생물명과 지역은 필수입니다."); return; }

    setUploading(true);
    setUploadMessage("업로드 중입니다...");
    try {
      const ext = selectedFile.name.split(".").pop() || "jpg";
      const filePath = `${currentUser.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("post-images").upload(filePath, selectedFile, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;

      const { data: imageData } = supabase.storage.from("post-images").getPublicUrl(filePath);
      const imageUrl = imageData.publicUrl;
      const { error: insertError } = await supabase.from("posts").insert({
        user_id: currentUser.id,
        species_name: form.species.trim(),
        category: form.category,
        caption: form.caption.trim(),
        image_url: imageUrl,
        region: form.location.trim(),
      });
      if (insertError) throw insertError;

      setForm({ species: "", location: "", caption: "", category: "fish" });
      setSelectedFile(null);
      setPreviewUrl("");
      setUploadMessage("업로드 완료! 피드에 반영되었습니다.");
      await fetchPosts();
      setTab("feed");
    } catch (err: any) {
      setUploadMessage(err?.message || "업로드에 실패했습니다. Storage 정책을 확인해주세요.");
    } finally {
      setUploading(false);
    }
  };

  const openComments = async (post: Post) => {
    setCommentPost(post);
    setComments([]);
    setCommentText("");
    if (!supabase || post.isSample) return;
    const { data } = await supabase.from("comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true });
    if (data) setComments(data);
  };

  const addComment = async () => {
    if (!supabase || !commentPost || commentPost.isSample) return;
    if (!currentUser) { openAuth("login"); return; }
    if (!commentText.trim()) return;
    const { error } = await supabase.from("comments").insert({ post_id: commentPost.id, user_id: currentUser.id, content: commentText.trim() });
    if (!error) { setCommentText(""); await openComments(commentPost); }
  };

  const AuthButtons = () => currentUser ? (
    <div className="flex items-center gap-2"><span className="hidden rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 md:inline">{currentUser.email}</span><Button onClick={handleLogout} variant="outline" className="rounded-xl border-slate-200 bg-slate-50 font-bold">로그아웃</Button></div>
  ) : (
    <div className="flex items-center gap-2"><Button onClick={() => openAuth("login")} variant="outline" className="rounded-xl border-slate-200 bg-slate-50 font-bold"><LogIn className="mr-1 h-4 w-4" />로그인</Button><Button onClick={() => openAuth("signup")} className="rounded-xl bg-blue-600 font-bold hover:bg-blue-700"><UserPlus className="mr-1 h-4 w-4" />회원가입</Button></div>
  );

  const navItems = [["home", "홈"], ["feed", "피드"], ["book", "도감"], ["rank", "랭킹"], ["weather", "해황"], ["data", "출현 모니터링"]];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><button onClick={() => setTab("home")} className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-2xl">🐟</div><div className="text-left"><p className="text-3xl font-black leading-none tracking-tight text-slate-900">Ho-cha</p><p className="mt-1 text-xs font-bold text-slate-500">연안의 모든 기록, 우리의 바다</p></div></button><nav className="hidden items-center gap-8 md:flex">{navItems.map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`border-b-2 py-2 text-sm font-black transition ${tab === key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-700 hover:text-blue-600"}`}>{label}</button>)}</nav><div className="hidden md:block"><AuthButtons /></div><button onClick={() => setMobileMenu(!mobileMenu)} className="rounded-xl p-2 text-slate-700 md:hidden">{mobileMenu ? <X /> : <Menu />}</button></div>{mobileMenu && <div className="border-t border-slate-200 bg-white px-5 py-3 md:hidden"><div className="grid gap-1">{navItems.map(([key, label]) => <button key={key} onClick={() => { setTab(key); setMobileMenu(false); }} className={`rounded-xl px-3 py-3 text-left text-sm font-bold ${tab === key ? "bg-blue-50 text-blue-600" : "text-slate-700"}`}>{label}</button>)}<div className="mt-2"><AuthButtons /></div></div></div>}</header>

      {tab === "home" && <><section className="relative overflow-hidden bg-slate-900"><div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-60" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-slate-950/20" /><div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-[1.25fr_0.75fr] md:items-center md:py-24"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">연안의 모든 기록,<br />우리의 바다</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-100">Ho-cha는 연안에서 만난 생물의 기록을 함께 나누는 공간입니다.</p><div className="mt-7 flex flex-wrap gap-3"><Button onClick={() => setTab("upload")} className="rounded-xl bg-blue-600 px-6 py-6 text-base font-black hover:bg-blue-700"><Camera className="mr-2 h-5 w-5" />기록 올리기</Button><Button onClick={() => setTab("feed")} variant="outline" className="rounded-xl border-white/30 bg-white/10 px-6 py-6 text-base font-black text-white hover:bg-white/20"><Eye className="mr-2 h-5 w-5" />둘러보기</Button></div><div className="mt-6 flex flex-wrap gap-2 text-sm text-white/90"><span className="rounded-full bg-white/15 px-3 py-1">사진 공유</span><span className="rounded-full bg-white/15 px-3 py-1">댓글 소통</span><span className="rounded-full bg-white/15 px-3 py-1">도감 수집</span><span className="rounded-full bg-white/15 px-3 py-1">해황 연동</span></div></motion.div><WeatherCard /></div></section><main className="mx-auto max-w-7xl px-5 py-8 md:py-10"><div className="grid gap-8 lg:grid-cols-[1fr_340px]"><div className="space-y-8"><section><SectionTitle title="오늘의 피드" desc={dbPostsLoaded && posts[0]?.isSample ? "아직 실제 기록이 없어 샘플을 보여줍니다." : "다른 사용자들이 올린 기록들입니다."} action="더보기" /><div className="grid gap-4 md:grid-cols-3">{posts.slice(0, 3).map((post) => <PostCard key={post.id} post={post} compact onComments={openComments} />)}</div></section><section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><SectionTitle title="최근 기록" desc="새로 올라온 기록이 이곳에 표시됩니다." action="더보기" /><div className="grid gap-4 md:grid-cols-3">{posts.slice(0, 3).map((post) => <PostCard key={`recent-${post.id}`} post={post} compact onComments={openComments} />)}</div></section></div><aside className="space-y-5"><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><h3 className="mb-4 text-xl font-black">이번 달 랭킹</h3><div className="space-y-3">{rankings.map((item) => <div key={item.rank} className="flex items-center gap-3 text-sm"><div className={`grid h-6 w-6 place-items-center rounded-full text-xs font-black ${item.rank <= 3 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{item.rank}</div><span className="text-lg">{item.avatar}</span><p className="flex-1 font-bold text-slate-800">{item.name}</p><p className="font-black text-slate-700">{item.score}</p></div>)}</div><Button onClick={() => setTab("rank")} variant="outline" className="mt-5 w-full rounded-xl bg-slate-50 font-bold">전체 랭킹 보기 <ChevronRight className="ml-1 h-4 w-4" /></Button></CardContent></Card><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><h3 className="text-xl font-black">내 도감 현황</h3><p className="mt-2 text-sm text-slate-500">발견한 생물</p><p className="mt-2 text-4xl font-black text-blue-600">23<span className="text-xl">종</span></p><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[23%] rounded-full bg-blue-600" /></div><Button onClick={() => setTab("book")} variant="outline" className="mt-5 w-full rounded-xl bg-slate-50 font-bold">도감 보기 <ChevronRight className="ml-1 h-4 w-4" /></Button></CardContent></Card><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><h3 className="text-xl font-black">출현 모니터링</h3><div className="mt-4 grid h-44 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-slate-100 text-center"><div><Map className="mx-auto mb-2 h-10 w-10 text-blue-500" /><p className="text-sm font-bold text-slate-700">대한민국 연안 기록 지도</p><p className="mt-1 text-xs text-slate-500">정확 위치는 권역 단위로 표시</p></div></div><Button onClick={() => setTab("data")} variant="outline" className="mt-5 w-full rounded-xl bg-slate-50 font-bold">자세히 보기 <ChevronRight className="ml-1 h-4 w-4" /></Button></CardContent></Card></aside></div><section className="mt-10 rounded-3xl bg-blue-50 p-6 md:p-8"><div className="grid gap-6 md:grid-cols-5 md:items-start"><div><h3 className="text-2xl font-black">Ho-cha 란?</h3><p className="mt-3 text-sm leading-6 text-slate-700">연안에서 만난 다양한 생물들을 기록하고 공유하며 우리의 바다를 함께 지켜가는 커뮤니티입니다.</p></div>{[[Camera, "기록하고 공유하기", "사진과 함께 생물 기록을 남겨주세요."], [BookOpen, "도감 채우기", "다양한 생물을 발견하고 나만의 도감을 완성하세요."], [Trophy, "랭킹 경쟁", "다른 사용자들과 다양한 생물 기록을 경쟁해보세요."], [Leaf, "바다를 지키기", "정확한 기록이 깨끗한 바다를 만드는 첫걸음입니다."]].map(([Icon, title, desc]: any[]) => <div key={title} className="text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm"><Icon className="h-6 w-6" /></div><p className="mt-3 font-black">{title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p></div>)}</div></section></main></>}

      {tab !== "home" && <main className="mx-auto max-w-7xl px-5 py-8 md:py-10">
        {tab === "feed" && <section><SectionTitle title="실시간 Ho-cha 피드" desc="실제 사용자가 올린 사진 기록이 표시됩니다." /><div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="어종, 지역, 닉네임 검색" className="rounded-xl border-slate-200 bg-slate-50 pl-9" /></div><Button onClick={() => setTab("upload")} className="rounded-xl bg-blue-600 font-bold hover:bg-blue-700"><Plus className="mr-1 h-4 w-4" />기록 올리기</Button></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredPosts.map((post) => <PostCard key={post.id} post={post} onComments={openComments} />)}</div></section>}
        {tab === "upload" && <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="mb-6 flex items-start gap-4 rounded-2xl bg-blue-50 p-4"><Info className="mt-0.5 h-5 w-5 flex-none text-blue-600" /><div><h2 className="text-2xl font-black">새 기록 올리기</h2><p className="mt-2 text-sm leading-6 text-slate-600">사진, 생물명, 지역을 입력하면 Supabase에 실제 저장됩니다.</p></div></div><div className="grid gap-4"><label className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center hover:bg-blue-50"><input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0])} />{previewUrl ? <img src={previewUrl} alt="preview" className="mb-4 max-h-72 w-full rounded-2xl object-cover" /> : <Camera className="mb-3 h-10 w-10 text-blue-500" />}<p className="font-black">{selectedFile ? selectedFile.name : "사진 선택"}</p><p className="mt-1 text-sm text-slate-500">모바일에서는 카메라 또는 앨범 선택</p><Button type="button" variant="outline" className="mt-4 rounded-xl bg-white"><Upload className="mr-1 h-4 w-4" />사진 선택</Button></label><div className="grid gap-3 md:grid-cols-2"><Input value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} placeholder="생물명 예: 쥐노래미, 꽃게" className="rounded-xl border-slate-200 bg-slate-50" /><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><option value="fish">물고기</option><option value="shell">패류·두족류</option><option value="crab">갑각류</option></select></div><div className="grid gap-2 md:grid-cols-[1fr_auto]"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="지역 예: 부산 기장 연안" className="rounded-xl border-slate-200 bg-slate-50" /><Button type="button" variant="outline" className="rounded-xl bg-white"><Navigation className="mr-1 h-4 w-4" />현재 위치</Button></div><Input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="간단한 설명" className="rounded-xl border-slate-200 bg-slate-50" /><Button onClick={handleUpload} disabled={uploading} className="rounded-xl bg-blue-600 py-6 font-black hover:bg-blue-700 disabled:opacity-60"><Plus className="mr-2 h-5 w-5" />{uploading ? "업로드 중..." : "기록 올리기"}</Button>{uploadMessage && <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{uploadMessage}</p>}</div></section>}
        {tab === "rank" && <section><SectionTitle title="월간 Ho-cha 랭킹" desc="종 다양성, 정확한 기록, 방류 인증을 중심으로 점수를 부여합니다." /><div className="grid gap-4 md:grid-cols-2">{rankings.map((item) => <Card key={item.rank} className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="flex items-center justify-between p-5"><div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-xl font-black text-blue-600">{item.rank}</div><div><p className="font-black">{item.avatar} {item.name}</p><p className="text-sm text-slate-500">기록 {item.score}</p></div></div><p className="text-lg font-black text-blue-600">{item.points} pt</p></CardContent></Card>)}</div></section>}
        {tab === "book" && <section><SectionTitle title="연안 도감" desc="기록된 생물은 도감에 자동 누적되며, 계절·지역·해황 정보와 연결됩니다." /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{speciesBook.map((item) => { const Icon = item.icon; return <Card key={item.name} className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon className="h-6 w-6" /></div><p className="text-lg font-black">{item.name}</p><p className="mt-1 text-sm text-slate-500">기록 {item.count}건</p><p className="mt-4 text-sm text-slate-600"><CalendarDays className="mr-1 inline h-4 w-4" /> {item.season}</p><p className="mt-2 text-sm text-slate-600"><Compass className="mr-1 inline h-4 w-4" /> {item.point}</p></CardContent></Card>; })}</div></section>}
        {tab === "weather" && <section className="grid gap-6 md:grid-cols-[1fr_420px] md:items-start"><div><SectionTitle title="지역별 해황" desc="GPS 또는 직접 선택한 지역을 기준으로 가까운 관측소의 해황 정보를 표시합니다." /><Card className="rounded-3xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><div className="grid h-96 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 text-center"><div><Map className="mx-auto mb-3 h-14 w-14 text-blue-500" /><p className="font-black">관측소 선택 지도 영역</p><p className="mt-2 text-sm text-slate-500">실제 서비스에서는 GPS 권한 요청 후 가까운 해양 관측소를 자동 선택합니다.</p></div></div></CardContent></Card></div><WeatherCard /></section>}
        {tab === "data" && <section><SectionTitle title="출현 모니터링" desc="시민 기록을 기반으로 계절·지역·수온별 연안 생물 출현 흐름을 확인합니다." /><div className="grid gap-5 md:grid-cols-2"><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><p className="mb-3 font-black text-blue-600">수집 데이터</p><ul className="space-y-2 text-sm leading-6 text-slate-600"><li>• 사진 기록, 생물명, 기록일</li><li>• 공개용 권역 위치</li><li>• 수온, 염분, 풍속, 파고</li><li>• 종별·월별·지역별 출현 빈도</li></ul></CardContent></Card><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><p className="mb-3 font-black text-blue-600">운영 원칙</p><ul className="space-y-2 text-sm leading-6 text-slate-600"><li>• 정확한 포인트는 공개하지 않음</li><li>• 금어기·금지체장·보호종 기록 검토</li><li>• 포획량보다 기록 정확도 중심 랭킹</li><li>• 장기적으로 연구·교육 자료화</li></ul></CardContent></Card></div></section>}
      </main>}

      {authOpen && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/60 px-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-2xl font-black text-slate-900">{authMode === "login" ? "로그인" : "회원가입"}</h2><p className="mt-2 text-sm leading-6 text-slate-500">Ho-cha 기록을 올리고 댓글을 남기려면 계정이 필요합니다.</p></div><button onClick={() => setAuthOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="grid gap-3">{authMode === "signup" && <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임" className="rounded-xl border-slate-200 bg-slate-50" />}<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" className="rounded-xl border-slate-200 bg-slate-50" /><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 6자 이상" className="rounded-xl border-slate-200 bg-slate-50" /><Button onClick={handleAuth} className="rounded-xl bg-blue-600 py-6 font-black hover:bg-blue-700">{authMode === "login" ? "로그인하기" : "회원가입하기"}</Button>{authMessage && <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{authMessage}</p>}<button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthMessage(""); }} className="text-sm font-bold text-blue-600">{authMode === "login" ? "처음 오셨나요? 회원가입" : "이미 계정이 있나요? 로그인"}</button></div></div></div>}

      {commentPost && <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/50 px-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-4 flex items-start justify-between"><div><h2 className="text-2xl font-black">댓글</h2><p className="mt-1 text-sm text-slate-500">{commentPost.species} · {commentPost.location}</p></div><button onClick={() => setCommentPost(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{commentPost.isSample ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">샘플 게시글에는 댓글을 저장하지 않습니다. 실제 업로드된 게시글에서 댓글 기능을 테스트할 수 있습니다.</p> : <><div className="max-h-72 space-y-3 overflow-auto rounded-2xl bg-slate-50 p-4">{comments.length === 0 ? <p className="text-sm text-slate-500">아직 댓글이 없습니다.</p> : comments.map((c) => <div key={c.id} className="rounded-xl bg-white p-3 text-sm text-slate-700"><p>{c.content}</p><p className="mt-1 text-xs text-slate-400">{formatDate(c.created_at)}</p></div>)}</div><div className="mt-4 flex gap-2"><Input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="댓글을 입력하세요" className="rounded-xl border-slate-200 bg-slate-50" /><Button onClick={addComment} className="rounded-xl bg-blue-600 font-bold hover:bg-blue-700">등록</Button></div></>}</div></div>}

      <footer className="mt-10 bg-slate-950 text-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between"><p className="text-3xl font-black">Ho-cha</p><div className="flex flex-wrap gap-6 text-sm text-slate-300"><button>이용약관</button><button>개인정보처리방침</button><button>운영정책</button><button>문의하기</button></div><p className="text-sm text-slate-400">© 2026 Ho-cha. All rights reserved.</p></div></footer>
    </div>
  );
}
