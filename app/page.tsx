"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  BarChart3,
  HelpCircle,
  Sparkles,
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
  ShieldCheck,
  Shell,
  Thermometer,
  Trophy,
  Trash2,
  Upload,
  User,
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
  { id: "sample-1", user_id: "sample", user: "바다소년", species: "쥐노래미", group: "fish", location: "부산 기장", temp: "18.6°C", wave: "0.4 m", caption: "오전에 족대로 잡았어요. 23cm 정도 됩니다.", likes: 24, comments: 5, img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80", tag: "물고기", date: "샘플", avatar: "🐟", isSample: true },
  { id: "sample-2", user_id: "sample", user: "낚시놀거위", species: "갑오징어", group: "shell", location: "통영 선암읍", temp: "17.8°C", wave: "0.5 m", caption: "방파제 앞에서 잡았습니다. 사이즈 좋은 녀석!", likes: 31, comments: 7, img: "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80", tag: "두족류", date: "샘플", avatar: "🦑", isSample: true },
  { id: "sample-3", user_id: "sample", user: "제주바당", species: "돌돔", group: "fish", location: "제주 서귀포", temp: "20.1°C", wave: "0.6 m", caption: "뜰채로 확인하고 바로 기록했습니다.", likes: 18, comments: 3, img: "https://images.unsplash.com/photo-1517420879524-86d64ac2f339?auto=format&fit=crop&w=900&q=80", tag: "물고기", date: "샘플", avatar: "🌊", isSample: true },
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


const speciesCatalog = [
  { standardName: "쥐노래미", scientificName: "Hexagrammos otakii", group: "노래미류", category: "fish", aliases: ["노래미", "쥐노래미", "놀래미"], rarity: "보통", note: "연안 암반과 방파제 주변에서 자주 기록되는 어류" },
  { standardName: "조피볼락", scientificName: "Sebastes schlegelii", group: "볼락류", category: "fish", aliases: ["우럭", "볼락", "조피볼락", "볼락류"], rarity: "흔함", note: "낚시 기록이 많은 대표적인 연안 볼락류" },
  { standardName: "감성돔", scientificName: "Acanthopagrus schlegelii", group: "돔류", category: "fish", aliases: ["감성돔", "감생이", "돔", "도미", "돔류"], rarity: "보통", note: "지역과 계절에 따라 출현 빈도 차이가 큰 돔류" },
  { standardName: "참돔", scientificName: "Pagrus major", group: "돔류", category: "fish", aliases: ["참돔", "도미", "돔", "돔류"], rarity: "보통", note: "연안과 외해성 기록이 함께 나타날 수 있는 돔류" },
  { standardName: "돌돔", scientificName: "Oplegnathus fasciatus", group: "돔류", category: "fish", aliases: ["돌돔", "갯돔", "돔류"], rarity: "드묾", note: "Ho-cha 내부 기록이 적으면 희귀도 후보로 다룰 수 있음" },
  { standardName: "망둑어류", scientificName: "Gobiidae spp.", group: "망둑어류", category: "fish", aliases: ["망둑어", "망둥어", "하구", "갯벌"], rarity: "흔함", note: "정확한 종 동정이 어려우면 과/류 수준으로 기록 가능" },
  { standardName: "꽃게", scientificName: "Portunus trituberculatus", group: "게류", category: "crab", aliases: ["꽃게", "게", "게류", "갑각류"], rarity: "보통", note: "갑각류 기록으로 분류" },
  { standardName: "갑오징어", scientificName: "Sepia esculenta", group: "두족류", category: "shell", aliases: ["갑오징어", "오징어", "두족류", "문어", "낙지"], rarity: "보통", note: "두족류 기록으로 분류" },
  { standardName: "고둥류", scientificName: "Gastropoda spp.", group: "패류", category: "shell", aliases: ["고둥", "소라", "패류", "조개", "복족류"], rarity: "흔함", note: "정확한 종을 모르면 패류/고둥류로 기록 가능" },
];

type SpeciesInfo = {
  protectedStatus: string;
  closedSeason: string;
  minSize: string;
  seasonal: string;
  caution: string;
  infoLevel: "safe" | "watch" | "caution";
};

const defaultSpeciesInfo: SpeciesInfo = {
  protectedStatus: "공식 보호종 정보 확인 필요",
  closedSeason: "공식 금어기 기준 확인 필요",
  minSize: "공식 금지체장 기준 확인 필요",
  seasonal: "지역·수온에 따라 차이 있음",
  caution: "생물 동정이 불확실하면 채집보다 관찰 기록을 우선하세요.",
  infoLevel: "watch",
};

const speciesInfoCatalog: Record<string, SpeciesInfo> = {
  "쥐노래미": { protectedStatus: "일반 기록 대상", closedSeason: "앱 DB 확인 필요", minSize: "앱 DB 확인 필요", seasonal: "봄·가을 기록이 많은 편", caution: "등지느러미 가시에 주의하고 작은 개체는 방류를 권장합니다.", infoLevel: "safe" },
  "조피볼락": { protectedStatus: "일반 기록 대상", closedSeason: "앱 DB 확인 필요", minSize: "앱 DB 확인 필요", seasonal: "겨울~봄 연안 기록이 많은 편", caution: "가시에 찔리지 않도록 장갑 사용을 권장합니다.", infoLevel: "safe" },
  "감성돔": { protectedStatus: "일반 기록 대상", closedSeason: "공식 금어기 기준 확인 필요", minSize: "공식 금지체장 기준 확인 필요", seasonal: "가을~겨울 기록이 많은 편", caution: "어린 개체와 산란기 개체 보호를 위해 금어기·체장 기준 확인이 필요합니다.", infoLevel: "watch" },
  "참돔": { protectedStatus: "일반 기록 대상", closedSeason: "공식 금어기 기준 확인 필요", minSize: "공식 금지체장 기준 확인 필요", seasonal: "봄~가을 지역별 차이", caution: "유사한 돔류가 많아 동정 오류에 주의하세요.", infoLevel: "watch" },
  "돌돔": { protectedStatus: "일반 기록 대상", closedSeason: "공식 금어기 기준 확인 필요", minSize: "공식 금지체장 기준 확인 필요", seasonal: "여름~가을 기록이 많은 편", caution: "치어·소형 개체는 방류를 권장합니다.", infoLevel: "watch" },
  "망둑어류": { protectedStatus: "종별 확인 필요", closedSeason: "종별 확인 필요", minSize: "종별 확인 필요", seasonal: "봄~가을 조간대·하구 기록 많음", caution: "망둑어류는 유사종이 많아 과/류 수준 기록 후 동정 요청을 권장합니다.", infoLevel: "watch" },
  "꽃게": { protectedStatus: "일반 기록 대상", closedSeason: "공식 금어기 기준 확인 필요", minSize: "공식 금지체장 기준 확인 필요", seasonal: "봄·가을 기록이 많은 편", caution: "집게와 날카로운 등갑에 주의하고 암컷·소형 개체 보호 기준을 확인하세요.", infoLevel: "caution" },
  "갑오징어": { protectedStatus: "일반 기록 대상", closedSeason: "공식 금어기 기준 확인 필요", minSize: "공식 기준 확인 필요", seasonal: "봄 산란기·가을 시즌 기록이 많은 편", caution: "먹물과 미끄러운 표면에 주의하고 산란기 개체 보호가 중요합니다.", infoLevel: "watch" },
  "고둥류": { protectedStatus: "종별 확인 필요", closedSeason: "종별 확인 필요", minSize: "종별 확인 필요", seasonal: "연중 관찰 가능", caution: "독성 패류·유사종 가능성이 있어 섭취 목적 채집은 지양하고 정확한 동정이 필요합니다.", infoLevel: "caution" },
};

function getSpeciesInfo(name: string): SpeciesInfo {
  const meta = getSpeciesMeta(name);
  if (meta && speciesInfoCatalog[meta.standardName]) return speciesInfoCatalog[meta.standardName];
  return defaultSpeciesInfo;
}

function getTimeOfDay(dateText: string) {
  if (dateText.includes("오전") || dateText.includes("AM")) return "오전 기록";
  if (dateText.includes("오후") || dateText.includes("PM")) return "오후 기록";
  return "기록 시간 저장";
}

type SpeciesCandidate = (typeof speciesCatalog)[number];

function findSpeciesCandidates(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return speciesCatalog
    .filter((item) => [item.standardName, item.scientificName, item.group, ...item.aliases].some((v) => v.toLowerCase().includes(q)))
    .slice(0, 6);
}

function getSpeciesMeta(name: string) {
  const q = name.trim().toLowerCase();
  if (!q) return null;
  return speciesCatalog.find((item) => item.standardName.toLowerCase() === q || item.aliases.some((alias) => alias.toLowerCase() === q)) || null;
}

function getIdentificationStatus(post: Post) {
  if (post.species.startsWith("동정 요청") || post.species.includes("미동정")) return { label: "동정 요청", tone: "amber", desc: "다른 사용자의 동정 도움이 필요한 기록" };
  const meta = getSpeciesMeta(post.species);
  if (meta) return { label: "표준종 연결", tone: "emerald", desc: `${meta.standardName} · ${meta.scientificName}` };
  return { label: "미확인", tone: "slate", desc: "표준종 후보와 아직 연결되지 않은 기록" };
}

function getRecordQuality(post: Post) {
  let score = 0;
  if (post.img) score += 1;
  if (post.location && post.location !== "지역 미입력") score += 1;
  if (post.latitude && post.longitude) score += 1;
  if (getSpeciesMeta(post.species)) score += 1;
  if (post.caption && post.caption.length >= 5) score += 1;
  if (post.comments > 0) score += 1;
  if (score >= 5) return { label: "높음", score };
  if (score >= 3) return { label: "보통", score };
  return { label: "낮음", score };
}

type Post = {
  id: string;
  user_id?: string;
  user: string;
  species: string;
  group: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
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
  likedByMe?: boolean;
};

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id?: string;
};

type LocationState = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
};

type ProfileForm = {
  nickname: string;
  bio: string;
  favorite_group: string;
  featured_badge: string;
  avatar_url: string;
};

function formatDate(value?: string) {
  if (!value) return "방금 전";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "방금 전";
  return d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) + " " + d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}


function getOsmEmbedUrl(latitude: number | null, longitude: number | null) {
  if (latitude === null || longitude === null) return "";
  const delta = 0.01;
  const left = longitude - delta;
  const right = longitude + delta;
  const top = latitude + delta;
  const bottom = latitude - delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}

function CoordinateMap({ latitude, longitude }: { latitude: number | null; longitude: number | null }) {
  if (latitude === null || longitude === null) {
    return (
      <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white text-center">
        <div>
          <MapPin className="mx-auto mb-3 h-10 w-10 text-slate-400" />
          <p className="font-black text-slate-700">지도 미리보기</p>
          <p className="mt-1 text-sm text-slate-500">현재 위치 저장 또는 좌표 입력 후 지도가 표시됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <iframe
        title="선택 위치 지도"
        src={getOsmEmbedUrl(latitude, longitude)}
        className="h-72 w-full border-0"
        loading="lazy"
      />
      <div className="grid gap-2 border-t border-slate-100 p-3 text-xs text-slate-600 md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-2"><span className="font-bold">위도</span> {latitude.toFixed(6)}</div>
        <div className="rounded-xl bg-slate-50 p-2"><span className="font-bold">경도</span> {longitude.toFixed(6)}</div>
      </div>
    </div>
  );
}

function mapDbPost(row: any): Post {
  const category = row.category || "fish";
  return {
    id: row.id,
    user_id: row.user_id,
    user: "Ho-cha 사용자",
    species: row.species_name || "미동정 생물",
    group: category,
    location: row.region || "지역 미입력",
    latitude: row.latitude,
    longitude: row.longitude,
    temp: row.water_temp || undefined,
    wave: row.wave_height || undefined,
    caption: row.caption || "새로운 Ho-cha 기록입니다.",
    likes: row.likes_count ?? row.likes ?? 0,
    comments: row.comments_count ?? row.comments ?? 0,
    img: row.image_url || "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
    tag: category === "shell" ? "패류" : category === "crab" ? "갑각류" : "물고기",
    date: formatDate(row.created_at),
    avatar: category === "shell" ? "🐚" : category === "crab" ? "🦀" : "🐟",
    likedByMe: row.liked_by_me ?? false,
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

function ObservationInfoCard({ post }: { post: Post }) {
  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-black text-slate-800">
        <CalendarDays className="h-4 w-4 text-blue-600" /> 관찰 정보
      </div>
      <div className="grid gap-2 text-xs leading-5 text-slate-600 md:grid-cols-2">
        <div className="rounded-xl bg-white p-2"><span className="font-bold text-slate-800">시간</span> {post.date}</div>
        <div className="rounded-xl bg-white p-2"><span className="font-bold text-slate-800">공개 지역</span> {post.location || "지역 미입력"}</div>
        <div className="rounded-xl bg-white p-2"><span className="font-bold text-slate-800">시간대</span> {getTimeOfDay(post.date)}</div>
        <div className="rounded-xl bg-white p-2"><span className="font-bold text-slate-800">위치 데이터</span> {post.latitude && post.longitude ? "GPS 저장됨" : "권역명만 표시"}</div>
        {post.temp && <div className="rounded-xl bg-white p-2"><span className="font-bold text-slate-800">수온</span> {post.temp}</div>}
        {post.wave && <div className="rounded-xl bg-white p-2"><span className="font-bold text-slate-800">파고</span> {post.wave}</div>}
      </div>
      <p className="mt-2 text-[11px] leading-4 text-slate-400">정확 좌표는 데이터 분석용으로만 저장하고, 공개 피드에는 권역명 중심으로 표시합니다.</p>
    </div>
  );
}

function SpeciesRegulationCard({ post }: { post: Post }) {
  const info = getSpeciesInfo(post.species);
  const tone = info.infoLevel === "caution" ? "border-red-200 bg-red-50 text-red-700" : info.infoLevel === "watch" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-700";
  return (
    <div className={`mt-3 rounded-2xl border p-3 ${tone}`}>
      <div className="mb-2 flex items-center gap-2 text-sm font-black">
        <ShieldCheck className="h-4 w-4" /> 생물 안전·규정 정보
      </div>
      <div className="grid gap-2 text-xs leading-5 md:grid-cols-2">
        <div><span className="font-black">보호종</span> · {info.protectedStatus}</div>
        <div><span className="font-black">금어기</span> · {info.closedSeason}</div>
        <div><span className="font-black">금지체장</span> · {info.minSize}</div>
        <div><span className="font-black">제철/시즌</span> · {info.seasonal}</div>
      </div>
      <p className="mt-2 text-xs leading-5"><span className="font-black">주의</span> · {info.caution}</p>
      <p className="mt-2 text-[11px] leading-4 opacity-80">금어기·금지체장·보호종 정보는 법령 개정 가능성이 있으므로 공식 기준 확인용 데이터로 관리해야 합니다.</p>
    </div>
  );
}

function MonthlyInfoCards({ month }: { month: number }) {
  const monthLabel = `${month}월`;
  const seasonal = speciesCatalog.filter((s) => {
    const info = getSpeciesInfo(s.standardName);
    return info.seasonal.includes("봄") || info.seasonal.includes("가을") || info.seasonal.includes("연중");
  }).slice(0, 4);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="rounded-2xl border-blue-200 bg-blue-50 shadow-sm"><CardContent className="p-5"><CalendarDays className="mb-2 h-6 w-6 text-blue-600" /><p className="text-sm font-bold text-blue-700">{monthLabel} 관찰 정보</p><p className="mt-2 text-sm leading-6 text-slate-700">월별 금어기·금지체장 정보는 공식 기준과 연결할 수 있도록 구조를 마련했습니다.</p></CardContent></Card>
      <Card className="rounded-2xl border-emerald-200 bg-emerald-50 shadow-sm"><CardContent className="p-5"><Leaf className="mb-2 h-6 w-6 text-emerald-600" /><p className="text-sm font-bold text-emerald-700">제철·시즌 후보</p><div className="mt-3 flex flex-wrap gap-2">{seasonal.map((s) => <span key={s.standardName} className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">{s.standardName}</span>)}</div></CardContent></Card>
      <Card className="rounded-2xl border-amber-200 bg-amber-50 shadow-sm"><CardContent className="p-5"><Info className="mb-2 h-6 w-6 text-amber-600" /><p className="text-sm font-bold text-amber-700">주의 생물 안내</p><p className="mt-2 text-sm leading-6 text-slate-700">가시, 독성, 집게, 패각 절단면 등 현장 안전 주의사항을 종 정보와 함께 표시합니다.</p></CardContent></Card>
    </div>
  );
}

function PostCard({
  post,
  compact = false,
  currentUserId,
  onComments,
  onLike,
  onDelete,
}: {
  post: Post;
  compact?: boolean;
  currentUserId?: string;
  onComments: (post: Post) => void;
  onLike: (post: Post) => void;
  onDelete: (post: Post) => void;
}) {
  const canDelete = !post.isSample && Boolean(currentUserId) && post.user_id === currentUserId;
  const status = getIdentificationStatus(post);
  const quality = getRecordQuality(post);

  return (
    <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-3 p-4">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-50 text-lg">{post.avatar}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-900">{post.user}</p>
          <p className="truncate text-xs text-slate-500">{post.date}{post.location ? ` · ${post.location}` : ""}</p>
        </div>
        {canDelete && (
          <button onClick={() => onDelete(post)} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="내 게시글 삭제">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <img src={post.img} alt={post.species} className={`${compact ? "h-44" : "h-52"} w-full object-cover`} />
      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h3 className="font-black text-slate-900">{post.species}</h3>
          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">{post.tag}</span>
          <span className={`rounded-full px-2 py-1 text-xs font-bold ${status.tone === "emerald" ? "bg-emerald-50 text-emerald-700" : status.tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`} title={status.desc}>{status.label}</span>
          <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">품질 {quality.label}</span>
          {post.latitude && post.longitude && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">위치 저장됨</span>}
          {post.isSample && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">샘플</span>}
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{post.caption}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          {post.temp && <span className="rounded-full bg-slate-100 px-2 py-1">수온 {post.temp}</span>}
          {post.wave && <span className="rounded-full bg-slate-100 px-2 py-1">파고 {post.wave}</span>}
        </div>
        {!compact && <ObservationInfoCard post={post} />}
        {!compact && <SpeciesRegulationCard post={post} />}
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
          <button onClick={() => onLike(post)} className={`flex items-center gap-1 font-bold transition ${post.likedByMe ? "text-red-500" : "hover:text-red-500"}`}>
            <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-current" : ""}`} />{post.likes}
          </button>
          <button onClick={() => onComments(post)} className="flex items-center gap-1 hover:text-blue-600">
            <MessageCircle className="h-4 w-4" />댓글 {post.comments}
          </button>
          <button className="ml-auto flex items-center gap-1 text-xs text-slate-400"><Flag className="h-3.5 w-3.5" />신고</button>
        </div>
      </div>
    </motion.article>
  );
}

function WeatherCard() {
  return (
    <Card className="rounded-3xl border-0 bg-slate-900/92 text-white shadow-2xl backdrop-blur">
      <CardContent className="p-6">
        <div className="mb-5 flex items-start justify-between">
          <div><h3 className="text-2xl font-black">오늘의 해황</h3><p className="mt-3 flex items-center gap-1 text-sm text-slate-200"><MapPin className="h-4 w-4" /> 부산 기장군 연안</p></div>
          <p className="text-xs text-slate-300">데모 기준</p>
        </div>
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/10 p-3">
          <div className="border-b border-r border-white/10 p-3"><p className="mb-2 text-xs text-slate-300">수온</p><p className="flex items-center gap-2 text-2xl font-black"><Thermometer className="h-6 w-6" />18.6°C</p></div>
          <div className="border-b border-white/10 p-3"><p className="mb-2 text-xs text-slate-300">파고</p><p className="flex items-center gap-2 text-2xl font-black"><Waves className="h-6 w-6" />0.4m</p></div>
          <div className="border-r border-white/10 p-3"><p className="mb-2 text-xs text-slate-300">풍속</p><p className="flex items-center gap-2 text-2xl font-black"><Wind className="h-6 w-6" />3.2m/s</p></div>
          <div className="p-3"><p className="mb-2 text-xs text-slate-300">염분</p><p className="flex items-center gap-2 text-2xl font-black"><Droplets className="h-6 w-6" />33.8psu</p></div>
        </div>
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
  const [identificationMode, setIdentificationMode] = useState<"known" | "request">("known");
  const [speciesQuery, setSpeciesQuery] = useState("");
  const speciesSuggestions = useMemo(() => findSpeciesCandidates(speciesQuery), [speciesQuery]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [locationInfo, setLocationInfo] = useState<LocationState>({ latitude: null, longitude: null, accuracy: null });
  const [locationMessage, setLocationMessage] = useState("정확 좌표는 DB에만 저장하고, 피드에는 입력한 권역명만 표시합니다.");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({ nickname: "", bio: "", favorite_group: "", featured_badge: "", avatar_url: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [commentPost, setCommentPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const currentUserPosts = useMemo(() => posts.filter((post) => !post.isSample && post.user_id === currentUser?.id), [posts, currentUser]);
  const mySpeciesCount = useMemo(() => new Set(currentUserPosts.map((post) => post.species.trim()).filter(Boolean)).size, [currentUserPosts]);
  const myVerifiedSpeciesCount = useMemo(() => new Set(currentUserPosts.filter((post) => getSpeciesMeta(post.species)).map((post) => post.species.trim())).size, [currentUserPosts]);
  const myLocationCount = useMemo(() => new Set(currentUserPosts.map((post) => post.location).filter(Boolean)).size, [currentUserPosts]);
  const myBadges = useMemo(() => {
    const badges = [];
    if (currentUserPosts.length >= 1) badges.push("첫 Ho-cha 기록");
    if (mySpeciesCount >= 3) badges.push("3종 기록자");
    if (mySpeciesCount >= 10) badges.push("10종 기록자");
    if (currentUserPosts.some((post) => post.latitude && post.longitude)) badges.push("위치 기록자");
    if (myLocationCount >= 3) badges.push("연안 탐험가");
    if (currentUserPosts.some((post) => getIdentificationStatus(post).label === "동정 요청")) badges.push("동정 요청자");
    return badges;
  }, [currentUserPosts, mySpeciesCount, myLocationCount]);
  const filteredPosts = useMemo(() => posts.filter((post) => `${post.species} ${post.location} ${post.caption} ${post.user}`.toLowerCase().includes(query.toLowerCase())), [query, posts]);
  const dogamItems = useMemo(() => {
    const map = new globalThis.Map<string, { name: string; count: number; locations: Set<string>; meta: SpeciesCandidate | null; requestCount: number }>();
    posts.filter((post) => !post.isSample).forEach((post) => {
      const meta = getSpeciesMeta(post.species);
      const key = meta?.standardName || post.species || "미동정 생물";
      const prev = map.get(key) || { name: key, count: 0, locations: new Set<string>(), meta, requestCount: 0 };
      prev.count += 1;
      if (post.location) prev.locations.add(post.location);
      if (getIdentificationStatus(post).label === "동정 요청") prev.requestCount += 1;
      map.set(key, prev);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [posts]);

  const identificationPosts = useMemo(
    () => posts.filter((post) => !post.isSample && getIdentificationStatus(post).label === "동정 요청"),
    [posts]
  );

  const realPosts = useMemo(() => posts.filter((post) => !post.isSample), [posts]);

  const weeklyStats = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentPosts = realPosts.filter((post) => {
      const rawDate = post.date?.replace(/\. /g, '-').replace(/\./g, '');
      const parsed = new Date(rawDate);
      return Number.isNaN(parsed.getTime()) ? true : parsed >= sevenDaysAgo;
    });
    const source = recentPosts.length ? recentPosts : realPosts;
    const speciesMap = new globalThis.Map<string, number>();
    const regionMap = new globalThis.Map<string, number>();
    source.forEach((post) => {
      const speciesKey = getSpeciesMeta(post.species)?.standardName || post.species || "미동정 생물";
      speciesMap.set(speciesKey, (speciesMap.get(speciesKey) || 0) + 1);
      const regionKey = post.location || "지역 미입력";
      regionMap.set(regionKey, (regionMap.get(regionKey) || 0) + 1);
    });
    const topSpecies = Array.from(speciesMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topRegions = Array.from(regionMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const verifiedCount = realPosts.filter((post) => getIdentificationStatus(post).label === "표준종 연결").length;
    const locatedCount = realPosts.filter((post) => post.latitude && post.longitude).length;
    const requestCount = identificationPosts.length;
    return { topSpecies, topRegions, verifiedCount, locatedCount, requestCount, total: realPosts.length };
  }, [realPosts, identificationPosts]);

  const todaySpecies = useMemo(() => {
    const source = realPosts.length ? realPosts : posts.filter((post) => !post.isSample);
    if (source.length === 0) return null;
    const speciesMap = new globalThis.Map<string, { name: string; count: number; locations: Set<string>; recentPost: Post; meta: SpeciesCandidate | null }>();
    source.forEach((post) => {
      const meta = getSpeciesMeta(post.species);
      const name = meta?.standardName || post.species || "미동정 생물";
      const prev = speciesMap.get(name) || { name, count: 0, locations: new Set<string>(), recentPost: post, meta };
      prev.count += 1;
      if (post.location) prev.locations.add(post.location);
      if (!prev.recentPost || post.id !== prev.recentPost.id) prev.recentPost = post;
      speciesMap.set(name, prev);
    });
    return Array.from(speciesMap.values()).sort((a, b) => b.count - a.count)[0];
  }, [realPosts, posts]);

  const personalDogam = useMemo(() => {
    const map = new globalThis.Map<string, { name: string; count: number; firstDate: string; latestDate: string; latestLocation: string; representativeImage: string; meta: SpeciesCandidate | null }>();
    currentUserPosts.forEach((post) => {
      const meta = getSpeciesMeta(post.species);
      const name = meta?.standardName || post.species || "미동정 생물";
      const prev = map.get(name);
      if (!prev) {
        map.set(name, {
          name,
          count: 1,
          firstDate: post.date,
          latestDate: post.date,
          latestLocation: post.location,
          representativeImage: post.img,
          meta,
        });
      } else {
        prev.count += 1;
        prev.latestDate = post.date;
        prev.latestLocation = post.location || prev.latestLocation;
        if (post.likes >= 0) prev.representativeImage = post.img || prev.representativeImage;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [currentUserPosts]);

  const userLevel = useMemo(() => {
    const score = currentUserPosts.length * 10 + mySpeciesCount * 15 + myLocationCount * 8 + myVerifiedSpeciesCount * 12;
    if (score >= 500) return { name: "연안 전문가", score, progress: 100, next: "최고 단계" };
    if (score >= 250) return { name: "연안 탐험가", score, progress: Math.min(100, Math.round((score / 500) * 100)), next: "연안 전문가" };
    if (score >= 100) return { name: "꾸준한 기록자", score, progress: Math.min(100, Math.round((score / 250) * 100)), next: "연안 탐험가" };
    if (score >= 30) return { name: "초보 기록자", score, progress: Math.min(100, Math.round((score / 100) * 100)), next: "꾸준한 기록자" };
    return { name: "새로운 관찰자", score, progress: Math.min(100, Math.round((score / 30) * 100)), next: "초보 기록자" };
  }, [currentUserPosts, mySpeciesCount, myLocationCount, myVerifiedSpeciesCount]);

  const fetchProfile = async () => {
    if (!supabase || !currentUser) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("nickname, bio, favorite_group, featured_badge, avatar_url")
      .eq("id", currentUser.id)
      .maybeSingle();

    if (error) {
      setProfileForm({
        nickname: currentUser.email?.split("@")[0] || "Ho-cha 사용자",
        bio: "",
        favorite_group: "",
        featured_badge: "",
        avatar_url: "",
      });
      return;
    }

    setProfileForm({
      nickname: data?.nickname || currentUser.email?.split("@")[0] || "Ho-cha 사용자",
      bio: data?.bio || "",
      favorite_group: data?.favorite_group || "",
      featured_badge: data?.featured_badge || "",
      avatar_url: data?.avatar_url || "",
    });
  };

  const saveProfile = async () => {
    if (!supabase || !currentUser) return;
    setSavingProfile(true);
    setProfileMessage("저장 중입니다...");

    let avatarUrl = profileForm.avatar_url.trim();

    try {
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop() || "jpg";
        const safeFileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: imageData } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        avatarUrl = imageData.publicUrl;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: currentUser.id,
        nickname: profileForm.nickname.trim() || currentUser.email?.split("@")[0] || "Ho-cha 사용자",
        bio: profileForm.bio.trim(),
        favorite_group: profileForm.favorite_group,
        featured_badge: profileForm.featured_badge,
        avatar_url: avatarUrl,
      });

      if (error) throw error;

      setProfileForm((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setAvatarFile(null);
      setProfileMessage("프로필이 저장되었습니다.");
    } catch (error) {
      console.error(error);
      setProfileMessage("저장 실패: 이미지 업로드 권한 또는 profiles 컬럼 추가 SQL을 확인해주세요.");
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchPosts = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      const postIds = data.map((row: any) => row.id);
      const [commentsResult, likesResult] = await Promise.all([
        postIds.length ? supabase.from("comments").select("post_id").in("post_id", postIds) : Promise.resolve({ data: [] as any[] }),
        postIds.length ? supabase.from("likes").select("post_id,user_id").in("post_id", postIds) : Promise.resolve({ data: [] as any[] }),
      ]);

      const commentCounts: Record<string, number> = {};
      (commentsResult.data || []).forEach((item: any) => {
        commentCounts[item.post_id] = (commentCounts[item.post_id] || 0) + 1;
      });

      const likeCounts: Record<string, number> = {};
      const likedByMe = new Set<string>();
      (likesResult.data || []).forEach((item: any) => {
        likeCounts[item.post_id] = (likeCounts[item.post_id] || 0) + 1;
        if (currentUser?.id && item.user_id === currentUser.id) likedByMe.add(item.post_id);
      });

      const mapped = data.map((row: any) => mapDbPost({
        ...row,
        likes_count: likeCounts[row.id] || 0,
        comments_count: commentCounts[row.id] || 0,
        liked_by_me: likedByMe.has(row.id),
      }));
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
    if (supabase) fetchPosts();
    if (currentUser) fetchProfile();
  }, [currentUser?.id]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

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
      setAuthMessage("로그인되었습니다.");
      setAuthOpen(false);
    }
  };

  const handleLogout = async () => { if (!supabase) return; await supabase.auth.signOut(); setCurrentUser(null); setTab("home"); };

  const handleFileChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadMessage("이미지 파일만 업로드할 수 있습니다."); return; }
    if (file.size > 8 * 1024 * 1024) { setUploadMessage("사진은 8MB 이하로 올려주세요."); return; }
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadMessage("");
  };

  const reverseGeocodeRegion = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=ko`);
      if (!response.ok) return "";
      const data = await response.json();
      const address = data?.address || {};
      const province = address.state || address.province || "";
      const city = address.city || address.county || address.town || address.municipality || "";
      const district = address.city_district || address.borough || address.suburb || "";
      const neighborhood = address.neighbourhood || address.quarter || address.village || address.hamlet || "";
      const parts = [province, city, district, neighborhood].filter(Boolean);
      return Array.from(new Set(parts)).join(" ");
    } catch {
      return "";
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("이 브라우저는 위치 기능을 지원하지 않습니다. 지역명을 직접 입력해주세요.");
      return;
    }
    setLocationMessage("현재 위치를 확인하는 중입니다...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocationInfo({ latitude, longitude, accuracy });
        setLocationMessage(`위치 저장 준비 완료 · 정확도 약 ${Math.round(accuracy)}m. 공개 지역명을 확인하는 중입니다...`);
        if (!form.location.trim()) {
          const regionName = await reverseGeocodeRegion(latitude, longitude);
          setForm((prev) => ({ ...prev, location: regionName || "현재 위치 기반 기록" }));
          setLocationMessage(regionName ? `공개 지역명을 자동 입력했습니다: ${regionName}. 필요하면 더 대략적으로 수정해주세요.` : `위치 좌표는 저장됩니다. 공개 지역명은 직접 입력해주세요.`);
        } else {
          setLocationMessage(`위치 저장 준비 완료 · 정확도 약 ${Math.round(accuracy)}m. 공개 화면에는 입력한 지역명만 표시됩니다.`);
        }
      },
      () => setLocationMessage("위치 권한이 거부되었습니다. 지역명을 직접 입력해도 기록할 수 있습니다."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const updateLatitude = (value: string) => {
    const latitude = Number(value);
    setLocationInfo((prev) => ({ ...prev, latitude: Number.isFinite(latitude) ? latitude : null }));
  };

  const updateLongitude = (value: string) => {
    const longitude = Number(value);
    setLocationInfo((prev) => ({ ...prev, longitude: Number.isFinite(longitude) ? longitude : null }));
  };

  const clearLocation = () => {
    setLocationInfo({ latitude: null, longitude: null, accuracy: null });
    setLocationMessage("좌표를 초기화했습니다. 공개 지역명만으로도 기록할 수 있습니다.");
  };

  const handleUpload = async () => {
    if (!supabase) { setUploadMessage("Supabase 연결이 필요합니다."); return; }
    if (!currentUser) { setUploadMessage("로그인 후 기록을 올릴 수 있습니다."); openAuth("login"); return; }
    if (!selectedFile) { setUploadMessage("사진을 선택해주세요."); return; }
    if (identificationMode === "known" && !form.species.trim()) { setUploadMessage("생물명을 입력하거나 동정 요청으로 올려주세요."); return; }
    if (!form.location.trim()) { setUploadMessage("공개 지역명은 필수입니다."); return; }

    setUploading(true);
    setUploadMessage("업로드 중입니다...");
    try {
      const ext = selectedFile.name.split(".").pop() || "jpg";
      const filePath = `${currentUser.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("post-images").upload(filePath, selectedFile, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;

      const { data: imageData } = supabase.storage.from("post-images").getPublicUrl(filePath);
      const speciesNameForSave = identificationMode === "request" ? `동정 요청${form.species.trim() ? `: ${form.species.trim()}` : ""}` : form.species.trim();
      const captionForSave = identificationMode === "request" ? `[동정 요청] ${form.caption.trim() || "이 생물의 이름을 알고 싶습니다."}` : form.caption.trim();
      const { error: insertError } = await supabase.from("posts").insert({
        user_id: currentUser.id,
        species_name: speciesNameForSave,
        category: form.category,
        caption: captionForSave,
        image_url: imageData.publicUrl,
        region: form.location.trim(),
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
      });
      if (insertError) throw insertError;

      setForm({ species: "", location: "", caption: "", category: "fish" });
      setSpeciesQuery("");
      setIdentificationMode("known");
      setLocationInfo({ latitude: null, longitude: null, accuracy: null });
      setLocationMessage("정확 좌표는 DB에만 저장하고, 피드에는 입력한 권역명만 표시합니다.");
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

  const toggleLike = async (post: Post) => {
    if (post.isSample) {
      setPosts((prev) => prev.map((item) => item.id === post.id ? { ...item, likedByMe: !item.likedByMe, likes: item.likedByMe ? Math.max(0, item.likes - 1) : item.likes + 1 } : item));
      return;
    }
    if (!supabase) return;
    if (!currentUser) { openAuth("login"); return; }

    const optimisticLiked = !post.likedByMe;
    setPosts((prev) => prev.map((item) => item.id === post.id ? { ...item, likedByMe: optimisticLiked, likes: optimisticLiked ? item.likes + 1 : Math.max(0, item.likes - 1) } : item));

    if (post.likedByMe) {
      const { error } = await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUser.id);
      if (error) await fetchPosts();
    } else {
      const { error } = await supabase.from("likes").insert({ post_id: post.id, user_id: currentUser.id });
      if (error) await fetchPosts();
    }
  };

  const deletePost = async (post: Post) => {
    if (!supabase || post.isSample) return;
    if (!currentUser || post.user_id !== currentUser.id) return;
    const ok = window.confirm("이 게시글을 삭제할까요? 삭제 후 되돌릴 수 없습니다.");
    if (!ok) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id).eq("user_id", currentUser.id);
    if (error) {
      alert(error.message || "삭제에 실패했습니다.");
      return;
    }
    setPosts((prev) => prev.filter((item) => item.id !== post.id));
    if (commentPost?.id === post.id) setCommentPost(null);
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
    if (!error) {
      setCommentText("");
      setPosts((prev) => prev.map((item) => item.id === commentPost.id ? { ...item, comments: item.comments + 1 } : item));
      setCommentPost((prev) => prev ? { ...prev, comments: prev.comments + 1 } : prev);
      await openComments({ ...commentPost, comments: commentPost.comments + 1 });
    }
  };

  const AuthButtons = () => currentUser ? (
    <div className="flex items-center gap-2">
      <Button onClick={() => setTab("profile")} variant="outline" className="rounded-xl border-blue-100 bg-blue-50 font-bold text-blue-700"><User className="mr-1 h-4 w-4" />내 프로필</Button>
      <Button onClick={handleLogout} variant="outline" className="rounded-xl border-slate-200 bg-slate-50 font-bold">로그아웃</Button>
    </div>
  ) : (
    <div className="flex items-center gap-2"><Button onClick={() => openAuth("login")} variant="outline" className="rounded-xl border-slate-200 bg-slate-50 font-bold"><LogIn className="mr-1 h-4 w-4" />로그인</Button><Button onClick={() => openAuth("signup")} className="rounded-xl bg-blue-600 font-bold hover:bg-blue-700"><UserPlus className="mr-1 h-4 w-4" />회원가입</Button></div>
  );

  const navItems = [["home", "홈"], ["feed", "피드"], ["upload", "기록 올리기"], ["identify", "동정 요청"], ["stats", "출현 통계"], ["info", "생물 정보"], ["book", "도감"], ["rank", "랭킹"], ["weather", "해황"], ["profile", "내 프로필"]];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button onClick={() => setTab("home")} className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-2xl">🐟</div><div className="text-left"><p className="text-3xl font-black leading-none tracking-tight text-slate-900">Ho-cha</p><p className="mt-1 text-xs font-bold text-slate-500">연안의 모든 기록, 우리의 바다</p></div></button>
          <nav className="hidden items-center gap-6 md:flex">{navItems.map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`border-b-2 py-2 text-sm font-black transition ${tab === key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-700 hover:text-blue-600"}`}>{label}</button>)}</nav>
          <div className="hidden md:block"><AuthButtons /></div>
          <button onClick={() => setMobileMenu(!mobileMenu)} className="rounded-xl p-2 text-slate-700 md:hidden">{mobileMenu ? <X /> : <Menu />}</button>
        </div>
        {mobileMenu && <div className="border-t border-slate-200 bg-white px-5 py-3 md:hidden"><div className="grid gap-1">{navItems.map(([key, label]) => <button key={key} onClick={() => { setTab(key); setMobileMenu(false); }} className={`rounded-xl px-3 py-3 text-left text-sm font-bold ${tab === key ? "bg-blue-50 text-blue-600" : "text-slate-700"}`}>{label}</button>)}<div className="mt-2"><AuthButtons /></div></div></div>}
      </header>

      {tab === "home" && <>
        <section className="relative overflow-hidden bg-slate-900"><div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-60" /><div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-slate-950/20" /><div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-[1.25fr_0.75fr] md:items-center md:py-24"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}><h1 className="max-w-2xl text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">연안의 모든 기록,<br />우리의 바다</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-100">Ho-cha는 연안에서 만난 생물의 기록을 함께 나누는 공간입니다.</p><div className="mt-7 flex flex-wrap gap-3"><Button onClick={() => setTab("upload")} className="rounded-xl bg-blue-600 px-6 py-6 text-base font-black hover:bg-blue-700"><Camera className="mr-2 h-5 w-5" />기록 올리기</Button><Button onClick={() => setTab("feed")} variant="outline" className="rounded-xl border-white/30 bg-white/10 px-6 py-6 text-base font-black text-white hover:bg-white/20"><Eye className="mr-2 h-5 w-5" />둘러보기</Button></div><div className="mt-6 flex flex-wrap gap-2 text-sm text-white/90"><span className="rounded-full bg-white/15 px-3 py-1">사진 공유</span><span className="rounded-full bg-white/15 px-3 py-1">댓글 소통</span><span className="rounded-full bg-white/15 px-3 py-1">무료 GPS 기록</span><span className="rounded-full bg-white/15 px-3 py-1">도감 수집</span></div></motion.div><WeatherCard /></div></section>
        <main className="mx-auto max-w-7xl px-5 py-8 md:py-10"><div className="grid gap-8 lg:grid-cols-[1fr_340px]"><div className="space-y-8"><section><SectionTitle title="오늘의 피드" desc={dbPostsLoaded && posts[0]?.isSample ? "아직 실제 기록이 없어 샘플을 보여줍니다." : "다른 사용자들이 올린 기록들입니다."} action="더보기" /><div className="grid gap-4 md:grid-cols-3">{posts.slice(0, 3).map((post) => <PostCard key={post.id} post={post} compact currentUserId={currentUser?.id} onComments={openComments} onLike={toggleLike} onDelete={deletePost} />)}</div></section><section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><SectionTitle title="최근 기록" desc="새로 올라온 기록이 이곳에 표시됩니다." action="더보기" /><div className="grid gap-4 md:grid-cols-3">{posts.slice(0, 3).map((post) => <PostCard key={`recent-${post.id}`} post={post} compact currentUserId={currentUser?.id} onComments={openComments} onLike={toggleLike} onDelete={deletePost} />)}</div></section><section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><SectionTitle title="오늘의 생물" desc="최근 기록에서 가장 많이 보인 생물을 자동으로 보여줍니다." action="도감 보기" />{todaySpecies ? <div className="grid gap-4 md:grid-cols-[180px_1fr]"><img src={todaySpecies.recentPost.img} alt={todaySpecies.name} className="h-40 w-full rounded-2xl object-cover" /><div className="flex flex-col justify-center"><div className="flex flex-wrap items-center gap-2"><p className="text-3xl font-black text-slate-900">{todaySpecies.name}</p>{todaySpecies.meta && <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">희귀도 {todaySpecies.meta.rarity}</span>}</div><p className="mt-2 text-sm leading-6 text-slate-600">최근 기록 {todaySpecies.count}건 · 주요 지역 {Array.from(todaySpecies.locations).slice(0, 3).join(", ") || "지역 미입력"}</p><p className="mt-2 text-sm leading-6 text-slate-500">{todaySpecies.meta?.note || "표준종 연결 전 기록입니다. 도감과 동정 요청을 통해 더 정확한 기록으로 정리할 수 있습니다."}</p><Button onClick={() => setTab("book")} variant="outline" className="mt-4 w-fit rounded-xl bg-slate-50 font-bold">도감에서 보기 <ChevronRight className="ml-1 h-4 w-4" /></Button></div></div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><Fish className="mx-auto mb-2 h-10 w-10 text-slate-400" /><p className="font-bold text-slate-700">아직 오늘의 생물을 뽑을 실제 기록이 없습니다.</p><p className="mt-1 text-sm text-slate-500">첫 기록을 올리면 이곳에 표시됩니다.</p></div>}</section><section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><SectionTitle title="이번 주 출현 요약" desc="실제 기록을 바탕으로 자동 계산됩니다." action="통계 보기" /><div className="grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-bold text-blue-600">총 기록</p><p className="mt-1 text-2xl font-black text-slate-900">{weeklyStats.total}건</p></div><div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-700">위치 기록</p><p className="mt-1 text-2xl font-black text-slate-900">{weeklyStats.locatedCount}건</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-bold text-amber-700">동정 요청</p><p className="mt-1 text-2xl font-black text-slate-900">{weeklyStats.requestCount}건</p></div></div></section></div><aside className="space-y-5"><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><h3 className="mb-4 text-xl font-black">내 활동 요약</h3>{currentUser ? <><p className="text-sm text-slate-500">내가 올린 기록</p><p className="mt-2 text-4xl font-black text-blue-600">{currentUserPosts.length}<span className="text-xl">건</span></p><p className="mt-3 text-sm text-slate-500">기록 생물 {mySpeciesCount}종</p><Button onClick={() => setTab("profile")} variant="outline" className="mt-5 w-full rounded-xl bg-slate-50 font-bold">내 프로필 보기 <ChevronRight className="ml-1 h-4 w-4" /></Button></> : <><p className="text-sm leading-6 text-slate-600">로그인하면 내 기록과 도감 현황을 따로 볼 수 있습니다.</p><Button onClick={() => openAuth("login")} className="mt-5 w-full rounded-xl bg-blue-600 font-bold">로그인</Button></>}</CardContent></Card><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><h3 className="text-xl font-black">출현 모니터링</h3><div className="mt-4 grid h-44 place-items-center rounded-xl bg-gradient-to-br from-blue-50 to-slate-100 text-center"><div><Map className="mx-auto mb-2 h-10 w-10 text-blue-500" /><p className="text-sm font-bold text-slate-700">무료 GPS 좌표 저장</p><p className="mt-1 text-xs text-slate-500">공개 화면에는 권역만 표시</p></div></div><Button onClick={() => setTab("data")} variant="outline" className="mt-5 w-full rounded-xl bg-slate-50 font-bold">자세히 보기 <ChevronRight className="ml-1 h-4 w-4" /></Button></CardContent></Card></aside></div><section className="mt-10 rounded-3xl bg-blue-50 p-6 md:p-8"><div className="grid gap-6 md:grid-cols-5 md:items-start"><div><h3 className="text-2xl font-black">Ho-cha 란?</h3><p className="mt-3 text-sm leading-6 text-slate-700">연안에서 만난 다양한 생물들을 기록하고 공유하며 우리의 바다를 함께 지켜가는 커뮤니티입니다.</p></div>{[[Camera, "기록하고 공유하기", "사진과 함께 생물 기록을 남겨주세요."], [MapPin, "위치 저장", "무료 GPS로 좌표를 저장하고 공개는 권역만 표시합니다."], [BookOpen, "도감 채우기", "다양한 생물을 발견하고 나만의 도감을 완성하세요."], [Leaf, "바다를 지키기", "정확한 기록이 깨끗한 바다를 만드는 첫걸음입니다."]].map(([Icon, title, desc]: any) => <div key={title} className="text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm"><Icon className="h-6 w-6" /></div><p className="mt-3 font-black">{title}</p><p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p></div>)}</div></section></main>
      </>}

      {tab !== "home" && <main className="mx-auto max-w-7xl px-5 py-8 md:py-10">
        {tab === "feed" && <section><SectionTitle title="실시간 Ho-cha 피드" desc="실제 사용자가 올린 사진 기록이 표시됩니다." /><div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="어종, 지역, 닉네임 검색" className="rounded-xl border-slate-200 bg-slate-50 pl-9" /></div><Button onClick={() => setTab("upload")} className="rounded-xl bg-blue-600 font-bold hover:bg-blue-700"><Plus className="mr-1 h-4 w-4" />기록 올리기</Button></div><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredPosts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUser?.id} onComments={openComments} onLike={toggleLike} onDelete={deletePost} />)}</div></section>}

        {tab === "upload" && <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="mb-6 flex items-start gap-4 rounded-2xl bg-blue-50 p-4"><Info className="mt-0.5 h-5 w-5 flex-none text-blue-600" /><div><h2 className="text-2xl font-black">새 기록 올리기</h2><p className="mt-2 text-sm leading-6 text-slate-600">생물명을 정확히 모르면 동정 요청으로 올릴 수 있습니다. 좌표는 데이터용으로 저장하고, 공개 피드에는 권역명만 표시합니다.</p></div></div><div className="grid gap-4"><label className="grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center hover:bg-blue-50"><input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0])} />{previewUrl ? <img src={previewUrl} alt="preview" className="mb-4 max-h-72 w-full rounded-2xl object-cover" /> : <Camera className="mb-3 h-10 w-10 text-blue-500" />}<p className="font-black">{selectedFile ? selectedFile.name : "사진 업로드 영역"}</p><p className="mt-1 text-sm text-slate-500">이 박스를 눌러 사진을 선택하세요.</p></label><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="mb-3 text-sm font-black text-slate-800">생물 동정 정보</p><div className="mb-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => setIdentificationMode("known")} className={`rounded-xl px-3 py-3 text-sm font-bold ${identificationMode === "known" ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>이름을 알고 있어요</button><button type="button" onClick={() => setIdentificationMode("request")} className={`rounded-xl px-3 py-3 text-sm font-bold ${identificationMode === "request" ? "bg-amber-500 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>동정 요청</button></div><Input value={speciesQuery} onChange={(e) => { setSpeciesQuery(e.target.value); setForm({ ...form, species: e.target.value }); }} placeholder={identificationMode === "known" ? "생물명 또는 그룹 검색 예: 볼락류, 돔류, 게류" : "모르면 비워두거나 특징 입력 예: 줄무늬 있는 작은 돔류"} className="rounded-xl border-slate-200 bg-white" />{speciesSuggestions.length > 0 && <div className="mt-3 grid gap-2">{speciesSuggestions.map((item) => <button key={item.standardName} type="button" onClick={() => { setForm({ ...form, species: item.standardName, category: item.category }); setSpeciesQuery(item.standardName); setIdentificationMode("known"); }} className="rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-blue-300 hover:bg-blue-50"><div className="flex flex-wrap items-center gap-2"><span className="font-black text-slate-900">{item.standardName}</span><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">{item.group}</span><span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">희귀도 {item.rarity}</span></div><p className="mt-1 text-xs italic text-slate-500">{item.scientificName}</p><p className="mt-1 text-xs text-slate-600">{item.note}</p></button>)}</div>}{identificationMode === "request" && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">동정 요청으로 올리면 피드에 “동정 요청” 상태가 표시됩니다. 다른 사용자가 댓글로 후보 종을 제안할 수 있습니다.</p>}</div><div className="grid gap-3 md:grid-cols-2"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm"><option value="fish">물고기</option><option value="crab">갑각류</option><option value="shell">패류·두족류</option></select><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="공개 지역명 예: 부산 기장군 대라리" className="rounded-xl border-slate-200 bg-slate-50" /></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center"><Button onClick={getCurrentLocation} variant="outline" className="rounded-xl bg-white"><Navigation className="mr-1 h-4 w-4" />현재 위치 저장</Button><Input value={locationInfo.latitude ?? ""} onChange={(e) => updateLatitude(e.target.value)} placeholder="위도 예: 35.076123" className="rounded-xl border-slate-200 bg-white" /><Input value={locationInfo.longitude ?? ""} onChange={(e) => updateLongitude(e.target.value)} placeholder="경도 예: 129.064321" className="rounded-xl border-slate-200 bg-white" /><Button onClick={clearLocation} variant="outline" className="rounded-xl bg-white">좌표 초기화</Button></div><p className="mt-3 text-xs leading-5 text-slate-500">{locationMessage}</p><div className="mt-3"><CoordinateMap latitude={locationInfo.latitude} longitude={locationInfo.longitude} /></div>{locationInfo.latitude && locationInfo.longitude && <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-700">좌표 저장 준비 완료: {locationInfo.latitude.toFixed(6)}, {locationInfo.longitude.toFixed(6)} · 공개 화면에는 이 좌표가 표시되지 않습니다.</div>}</div><Input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder={identificationMode === "request" ? "특징 설명 예: 몸통에 세로줄, 바위틈에서 발견" : "간단한 설명"} className="rounded-xl border-slate-200 bg-slate-50" /><Button onClick={handleUpload} disabled={uploading} className="rounded-xl bg-blue-600 py-6 font-black hover:bg-blue-700 disabled:opacity-60"><Plus className="mr-2 h-5 w-5" />{uploading ? "업로드 중..." : identificationMode === "request" ? "동정 요청 올리기" : "기록 올리기"}</Button>{uploadMessage && <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{uploadMessage}</p>}</div></section>}

        {tab === "identify" && <section><SectionTitle title="동정 요청 피드" desc="이름을 모르는 생물 기록만 모아봅니다. 댓글로 후보 종을 제안해 주세요." /><div className="mb-5 grid gap-4 md:grid-cols-3"><Card className="rounded-2xl border-amber-200 bg-amber-50 shadow-sm"><CardContent className="p-5"><HelpCircle className="mb-2 h-6 w-6 text-amber-600" /><p className="text-sm font-bold text-amber-700">동정 요청</p><p className="mt-1 text-3xl font-black text-slate-900">{identificationPosts.length}</p></CardContent></Card><Card className="rounded-2xl border-emerald-200 bg-emerald-50 shadow-sm"><CardContent className="p-5"><ShieldCheck className="mb-2 h-6 w-6 text-emerald-600" /><p className="text-sm font-bold text-emerald-700">표준종 연결</p><p className="mt-1 text-3xl font-black text-slate-900">{weeklyStats.verifiedCount}</p></CardContent></Card><Card className="rounded-2xl border-blue-200 bg-blue-50 shadow-sm"><CardContent className="p-5"><MessageCircle className="mb-2 h-6 w-6 text-blue-600" /><p className="text-sm font-bold text-blue-700">참여 방법</p><p className="mt-1 text-sm leading-6 text-slate-700">댓글로 “조피볼락 같아요”처럼 후보 종과 근거를 남겨주세요.</p></CardContent></Card></div>{identificationPosts.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><HelpCircle className="mx-auto mb-3 h-12 w-12 text-slate-400" /><p className="font-black">현재 동정 요청 기록이 없습니다</p><p className="mt-2 text-sm text-slate-500">이름을 모르는 생물은 기록 올리기에서 “동정 요청”으로 등록할 수 있습니다.</p><Button onClick={() => setTab("upload")} className="mt-5 rounded-xl bg-blue-600 font-bold">동정 요청 올리기</Button></div> : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{identificationPosts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUser?.id} onComments={openComments} onLike={toggleLike} onDelete={deletePost} />)}</div>}</section>}

        {tab === "stats" && <section><SectionTitle title="시즌·출현 통계" desc="현재 저장된 기록을 바탕으로 자동 계산한 요약입니다." /><div className="grid gap-5 lg:grid-cols-2"><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><div className="mb-4 flex items-center gap-2"><BarChart3 className="h-6 w-6 text-blue-600" /><h3 className="text-lg font-black">가장 많이 기록된 생물</h3></div>{weeklyStats.topSpecies.length === 0 ? <p className="text-sm text-slate-500">아직 실제 기록이 없습니다.</p> : <div className="space-y-3">{weeklyStats.topSpecies.map(([name, count], index) => <div key={name} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-700">{index + 1}</div><p className="flex-1 font-bold text-slate-800">{name}</p><p className="font-black text-blue-600">{count}건</p></div>)}</div>}</CardContent></Card><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><div className="mb-4 flex items-center gap-2"><MapPin className="h-6 w-6 text-emerald-600" /><h3 className="text-lg font-black">기록이 많은 지역</h3></div>{weeklyStats.topRegions.length === 0 ? <p className="text-sm text-slate-500">아직 위치 기록이 없습니다.</p> : <div className="space-y-3">{weeklyStats.topRegions.map(([name, count], index) => <div key={name} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">{index + 1}</div><p className="flex-1 font-bold text-slate-800">{name}</p><p className="font-black text-emerald-600">{count}건</p></div>)}</div>}</CardContent></Card><Card className="rounded-2xl border-slate-200 bg-white shadow-sm lg:col-span-2"><CardContent className="grid gap-4 p-6 md:grid-cols-4"><div className="rounded-2xl bg-blue-50 p-4"><p className="text-xs font-bold text-blue-600">전체 기록</p><p className="mt-1 text-3xl font-black">{weeklyStats.total}</p></div><div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-bold text-emerald-700">좌표 저장</p><p className="mt-1 text-3xl font-black">{weeklyStats.locatedCount}</p></div><div className="rounded-2xl bg-purple-50 p-4"><p className="text-xs font-bold text-purple-700">표준종 연결</p><p className="mt-1 text-3xl font-black">{weeklyStats.verifiedCount}</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs font-bold text-amber-700">동정 요청</p><p className="mt-1 text-3xl font-black">{weeklyStats.requestCount}</p></div></CardContent></Card></div></section>}

        {tab === "profile" && <section>{!currentUser ? <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><User className="mx-auto mb-4 h-12 w-12 text-blue-500" /><h2 className="text-2xl font-black">로그인이 필요합니다</h2><p className="mt-2 text-sm leading-6 text-slate-500">내 게시글, 도감 현황, 활동 기록을 보려면 로그인해주세요.</p><Button onClick={() => openAuth("login")} className="mt-5 rounded-xl bg-blue-600 font-bold">로그인하기</Button></div> : <><SectionTitle title="내 프로필" desc="내가 올린 기록과 도감 현황을 한눈에 확인합니다." /><div className="grid gap-5 lg:grid-cols-[340px_1fr]"><aside className="space-y-5"><Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm"><div className="h-24 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-300" /><CardContent className="p-6"><div className="-mt-14 flex items-end gap-4"><div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border-4 border-white bg-blue-50 text-4xl shadow-sm">{profileForm.avatar_url ? <img src={profileForm.avatar_url} alt="프로필 이미지" className="h-full w-full object-cover" /> : "🐟"}</div><div className="pb-1"><p className="text-xl font-black">{profileForm.nickname || currentUser.email?.split("@")[0]}</p><p className="text-sm text-slate-500">{currentUser.email}</p></div></div>{profileForm.bio && <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">{profileForm.bio}</p>}<div className="mt-4 flex flex-wrap gap-2">{profileForm.favorite_group && <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">관심 생물군: {profileForm.favorite_group}</span>}{profileForm.featured_badge && <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">대표 배지: {profileForm.featured_badge}</span>}</div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">내 기록</p><p className="mt-1 text-2xl font-black text-blue-600">{currentUserPosts.length}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">기록 생물</p><p className="mt-1 text-2xl font-black text-blue-600">{mySpeciesCount}</p></div></div><Button onClick={() => setTab("upload")} className="mt-5 w-full rounded-xl bg-blue-600 font-bold">새 기록 올리기</Button></CardContent></Card><Card className="rounded-3xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-600" /><h3 className="font-black">프로필 꾸미기</h3></div><div className="mt-4 grid gap-3"><Input value={profileForm.nickname} onChange={(e) => setProfileForm({ ...profileForm, nickname: e.target.value })} placeholder="닉네임" className="rounded-xl border-slate-200 bg-slate-50" /><Input value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="한 줄 자기소개" className="rounded-xl border-slate-200 bg-slate-50" /><label className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center transition hover:border-blue-300 hover:bg-blue-50"><input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setAvatarFile(file); setProfileMessage("프로필 저장을 누르면 새 이미지가 적용됩니다."); } }} /><div className="mx-auto mb-2 grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-white text-2xl shadow-sm">{profileForm.avatar_url ? <img src={profileForm.avatar_url} alt="현재 프로필 이미지" className="h-full w-full object-cover" /> : "🐟"}</div><p className="text-sm font-black text-slate-800">프로필 사진 업로드</p><p className="mt-1 text-xs text-slate-500">{avatarFile ? avatarFile.name : "클릭해서 사진을 선택하세요"}</p></label><select value={profileForm.favorite_group} onChange={(e) => setProfileForm({ ...profileForm, favorite_group: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700"><option value="">관심 생물군 선택</option><option value="물고기">물고기</option><option value="갑각류">갑각류</option><option value="패류">패류</option><option value="두족류">두족류</option><option value="기타 연안생물">기타 연안생물</option></select><select value={profileForm.featured_badge} onChange={(e) => setProfileForm({ ...profileForm, featured_badge: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700"><option value="">대표 배지 선택</option>{myBadges.map((badge) => <option key={badge} value={badge}>{badge}</option>)}</select><Button onClick={saveProfile} disabled={savingProfile} className="rounded-xl bg-blue-600 font-bold hover:bg-blue-700">{savingProfile ? "저장 중..." : "프로필 저장"}</Button>{profileMessage && <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{profileMessage}</p>}</div></CardContent></Card><Card className="rounded-3xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-600" /><h3 className="font-black">내 레벨</h3></div><p className="mt-3 text-2xl font-black text-slate-900">{userLevel.name}</p><p className="mt-1 text-sm text-slate-500">활동 점수 {userLevel.score}점 · 다음 단계: {userLevel.next}</p><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${userLevel.progress}%` }} /></div><p className="mt-3 text-xs leading-5 text-slate-500">기록 수, 종 다양성, 위치 기록, 표준종 연결을 바탕으로 계산됩니다.</p></CardContent></Card><Card className="rounded-3xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><h3 className="font-black">내 배지</h3>{myBadges.length === 0 ? <p className="mt-2 text-sm leading-6 text-slate-600">첫 기록을 올리면 배지가 표시됩니다.</p> : <div className="mt-3 flex flex-wrap gap-2">{myBadges.map((badge) => <span key={badge} className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">{badge}</span>)}</div>}<p className="mt-3 text-xs leading-5 text-slate-500">배지는 포획량보다 기록 다양성, 위치 기록, 동정 참여를 중심으로 확장할 예정입니다.</p></CardContent></Card><Card className="rounded-3xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><h3 className="font-black">위치 기록 안내</h3><p className="mt-2 text-sm leading-6 text-slate-600">현재 버전은 무료 브라우저 GPS와 OpenStreetMap 미리보기를 사용합니다. Google 지도 비용 없이 위도·경도를 DB에 저장하고, 피드에는 사용자가 입력한 권역명만 보여줍니다.</p></CardContent></Card></aside><div><SectionTitle title="개인 도감" desc="내가 직접 기록한 생물 컬렉션입니다." />{personalDogam.length === 0 ? <div className="mb-6 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center"><BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-400" /><p className="font-black">아직 개인 도감이 비어 있습니다</p><p className="mt-2 text-sm text-slate-500">기록을 올리면 생물별 카드가 자동으로 만들어집니다.</p></div> : <div className="mb-8 grid gap-4 md:grid-cols-2">{personalDogam.map((item) => <Card key={item.name} className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm"><img src={item.representativeImage} alt={item.name} className="h-32 w-full object-cover" /><CardContent className="p-4"><div className="flex flex-wrap items-center gap-2"><p className="text-lg font-black text-slate-900">{item.name}</p>{item.meta && <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">희귀도 {item.meta.rarity}</span>}</div><p className="mt-2 text-sm text-slate-500">총 기록 {item.count}건 · 최근 {item.latestLocation || "지역 미입력"}</p><p className="mt-1 text-xs text-slate-400">첫 기록 {item.firstDate} · 최근 기록 {item.latestDate}</p>{item.meta && <p className="mt-2 text-xs italic text-slate-500">{item.meta.scientificName}</p>}</CardContent></Card>)}</div>}<SectionTitle title="내 게시글" desc="내 계정으로 올린 기록만 모아봅니다." />{currentUserPosts.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><Camera className="mx-auto mb-3 h-12 w-12 text-slate-400" /><p className="font-black">아직 올린 기록이 없습니다</p><p className="mt-2 text-sm text-slate-500">첫 기록을 올리면 이곳에 표시됩니다.</p><Button onClick={() => setTab("upload")} className="mt-5 rounded-xl bg-blue-600 font-bold">첫 기록 올리기</Button></div> : <div className="grid gap-5 md:grid-cols-2">{currentUserPosts.map((post) => <PostCard key={post.id} post={post} currentUserId={currentUser?.id} onComments={openComments} onLike={toggleLike} onDelete={deletePost} />)}</div>}</div></div></>}</section>}

        {tab === "rank" && <section><SectionTitle title="월간 Ho-cha 랭킹" desc="종 다양성, 정확한 기록, 방류 인증을 중심으로 점수를 부여합니다." /><div className="grid gap-4 md:grid-cols-2">{rankings.map((item) => <Card key={item.rank} className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="flex items-center justify-between p-5"><div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-xl font-black text-blue-600">{item.rank}</div><div><p className="font-black">{item.avatar} {item.name}</p><p className="text-sm text-slate-500">기록 {item.score}</p></div></div><p className="text-lg font-black text-blue-600">{item.points} pt</p></CardContent></Card>)}</div></section>}
        {tab === "info" && <section><SectionTitle title="생물 정보와 안전 가이드" desc="보호종, 금어기, 금지체장, 제철 정보, 유해·주의 생물 정보를 한곳에서 확인합니다." /><MonthlyInfoCards month={new Date().getMonth() + 1} /><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{speciesCatalog.map((sp) => { const info = getSpeciesInfo(sp.standardName); return <Card key={sp.standardName} className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><div className="mb-3 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">{sp.category === "shell" ? <Shell className="h-5 w-5" /> : <Fish className="h-5 w-5" />}</div><div><p className="font-black text-slate-900">{sp.standardName}</p><p className="text-xs italic text-slate-500">{sp.scientificName}</p></div></div><div className="mb-3 flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">{sp.group}</span><span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">앱 희귀도 {sp.rarity}</span></div><div className="space-y-2 text-sm leading-6 text-slate-600"><p><span className="font-black text-slate-800">보호종</span> · {info.protectedStatus}</p><p><span className="font-black text-slate-800">금어기</span> · {info.closedSeason}</p><p><span className="font-black text-slate-800">금지체장</span> · {info.minSize}</p><p><span className="font-black text-slate-800">제철/시즌</span> · {info.seasonal}</p><p className="rounded-xl bg-slate-50 p-3 text-xs leading-5"><span className="font-black">주의</span> · {info.caution}</p></div></CardContent></Card>; })}</div><Card className="mt-6 rounded-2xl border-amber-200 bg-amber-50 shadow-sm"><CardContent className="p-5"><p className="font-black text-amber-800">운영 기준</p><p className="mt-2 text-sm leading-6 text-slate-700">현재 포함된 생물 정보는 기능 확인용 기본 데이터입니다. 실제 서비스 운영 전에는 해양수산부 금어기·금지체장 기준, 국립수산과학원 자료, 해양보호생물 지정현황을 기준으로 species_master 데이터를 검수해야 합니다.</p></CardContent></Card></section>}

        {tab === "book" && <section><SectionTitle title="연안 도감" desc="실제 업로드 기록을 기준으로 자동 집계합니다. 표준종 연결 기록과 동정 요청 기록을 구분합니다." />{dogamItems.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center"><BookOpen className="mx-auto mb-3 h-12 w-12 text-slate-400" /><p className="font-black">아직 실제 도감 기록이 없습니다</p><p className="mt-2 text-sm text-slate-500">첫 기록을 올리면 도감이 자동으로 채워집니다.</p><Button onClick={() => setTab("upload")} className="mt-5 rounded-xl bg-blue-600 font-bold">기록 올리기</Button></div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{dogamItems.map((item) => { const meta = item.meta; const statusLabel = meta ? "표준종 연결" : item.requestCount > 0 ? "동정 요청 포함" : "미확인"; return <Card key={item.name} className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-5"><div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">{meta?.category === "shell" ? <Shell className="h-6 w-6" /> : <Fish className="h-6 w-6" />}</div><p className="text-lg font-black">{item.name}</p><p className="mt-1 text-sm text-slate-500">기록 {item.count}건 · 지역 {item.locations.size}곳</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600">{meta?.group || "사용자 입력"}</span><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{statusLabel}</span>{meta && <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700">희귀도 {meta.rarity}</span>}</div>{meta && <p className="mt-3 text-xs italic text-slate-500">{meta.scientificName}</p>}<p className="mt-2 text-sm leading-6 text-slate-600">{meta?.note || "표준종 후보와 연결되지 않은 기록입니다. 이후 동정 검토 기능으로 정리할 수 있습니다."}</p></CardContent></Card>; })}</div>}</section>}
        {tab === "weather" && <section className="grid gap-6 md:grid-cols-[1fr_420px] md:items-start"><div><SectionTitle title="지역별 해황" desc="현재는 데모 화면입니다. 이후 공공 해양 API와 연결합니다." /><Card className="rounded-3xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><div className="grid h-96 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-slate-100 text-center"><div><Map className="mx-auto mb-3 h-14 w-14 text-blue-500" /><p className="font-black">무료 GPS 기반 위치 저장</p><p className="mt-2 text-sm text-slate-500">지도 API 없이도 위도·경도 저장은 가능합니다.</p></div></div></CardContent></Card></div><WeatherCard /></section>}
        {tab === "data" && <section><SectionTitle title="출현 모니터링" desc="시민 기록을 기반으로 계절·지역·수온별 연안 생물 출현 흐름을 확인합니다." /><div className="grid gap-5 md:grid-cols-2"><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><p className="mb-3 font-black text-blue-600">수집 데이터</p><ul className="space-y-2 text-sm leading-6 text-slate-600"><li>• 사진 기록, 생물명, 기록일</li><li>• 공개용 권역 위치</li><li>• 비공개 좌표 기반 출현 위치</li><li>• 추후 수온, 염분, 풍속, 파고 연결</li></ul></CardContent></Card><Card className="rounded-2xl border-slate-200 bg-white shadow-sm"><CardContent className="p-6"><p className="mb-3 font-black text-blue-600">운영 원칙</p><ul className="space-y-2 text-sm leading-6 text-slate-600"><li>• 정확한 포인트는 공개하지 않음</li><li>• 금어기·금지체장·보호종 기록 검토</li><li>• 포획량보다 기록 정확도 중심 랭킹</li><li>• 장기적으로 연구·교육 자료화</li><li>• 동정 요청 기록은 검토 대상으로 분류</li><li>• 표준종 연결 기록은 도감·지도 데이터 품질 향상에 활용</li></ul></CardContent></Card></div></section>}
      </main>}

      {authOpen && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/60 px-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><h2 className="text-2xl font-black text-slate-900">{authMode === "login" ? "로그인" : "회원가입"}</h2><p className="mt-2 text-sm leading-6 text-slate-500">Ho-cha 기록을 올리고 댓글을 남기려면 계정이 필요합니다.</p></div><button onClick={() => setAuthOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="grid gap-3">{authMode === "signup" && <Input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임" className="rounded-xl border-slate-200 bg-slate-50" />}<Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일" className="rounded-xl border-slate-200 bg-slate-50" /><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 6자 이상" className="rounded-xl border-slate-200 bg-slate-50" /><Button onClick={handleAuth} className="rounded-xl bg-blue-600 py-6 font-black hover:bg-blue-700">{authMode === "login" ? "로그인하기" : "회원가입하기"}</Button>{authMessage && <p className="rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{authMessage}</p>}<button onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthMessage(""); }} className="text-sm font-bold text-blue-600">{authMode === "login" ? "처음 오셨나요? 회원가입" : "이미 계정이 있나요? 로그인"}</button></div></div></div>}

      {commentPost && <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/50 px-4 backdrop-blur-sm"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-4 flex items-start justify-between"><div><h2 className="text-2xl font-black">댓글</h2><p className="mt-1 text-sm text-slate-500">{commentPost.species} · {commentPost.location}</p></div><button onClick={() => setCommentPost(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>{commentPost.isSample ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">샘플 게시글에는 댓글을 저장하지 않습니다. 실제 업로드된 게시글에서 댓글 기능을 테스트할 수 있습니다.</p> : <><div className="max-h-72 space-y-3 overflow-auto rounded-2xl bg-slate-50 p-4">{comments.length === 0 ? <p className="text-sm text-slate-500">아직 댓글이 없습니다.</p> : comments.map((c) => <div key={c.id} className="rounded-xl bg-white p-3 text-sm text-slate-700"><p>{c.content}</p><p className="mt-1 text-xs text-slate-400">{formatDate(c.created_at)}</p></div>)}</div><div className="mt-4 flex gap-2"><Input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="댓글을 입력하세요" className="rounded-xl border-slate-200 bg-slate-50" /><Button onClick={addComment} className="rounded-xl bg-blue-600 font-bold hover:bg-blue-700">등록</Button></div></>}</div></div>}

      <footer className="mt-10 bg-slate-950 text-white"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 md:flex-row md:items-center md:justify-between"><p className="text-3xl font-black">Ho-cha</p><div className="flex flex-wrap gap-6 text-sm text-slate-300"><button>이용약관</button><button>개인정보처리방침</button><button>운영정책</button><button>문의하기</button></div><p className="text-sm text-slate-400">© 2026 Ho-cha. All rights reserved.</p></div></footer>
    </div>
  );
}
