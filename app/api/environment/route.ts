import { NextResponse } from "next/server";

type Station = {
  name: string;
  code: string;
  lat: number;
  lon: number;
};

const stations: Station[] = [
  { name: "부산", code: "DT_0005", lat: 35.096, lon: 129.035 },
  { name: "부산항", code: "DT_0006", lat: 35.103, lon: 129.042 },
  { name: "울산", code: "DT_0020", lat: 35.501, lon: 129.387 },
  { name: "통영", code: "DT_0014", lat: 34.827, lon: 128.434 },
  { name: "여수", code: "DT_0016", lat: 34.747, lon: 127.765 },
  { name: "제주", code: "DT_0004", lat: 33.527, lon: 126.543 },
  { name: "인천", code: "DT_0001", lat: 37.451, lon: 126.592 },
  { name: "목포", code: "DT_0007", lat: 34.779, lon: 126.375 },
];

function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const lat1 = (aLat * Math.PI) / 180;
  const lat2 = (bLat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestStation(lat: number, lon: number) {
  return stations
    .map((station) => ({ ...station, distance: distanceKm(lat, lon, station.lat, station.lon) }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function dfsXyConv(lat: number, lon: number) {
  const RE = 6371.00877;
  const GRID = 5.0;
  const SLAT1 = 30.0;
  const SLAT2 = 60.0;
  const OLON = 126.0;
  const OLAT = 38.0;
  const XO = 43;
  const YO = 136;
  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;
  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  return { nx: Math.floor(ra * Math.sin(theta) + XO + 0.5), ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5) };
}

function formatKmaBase() {
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const base = new Date(now);
  base.setUTCMinutes(0, 0, 0);
  if (now.getUTCMinutes() < 40) base.setUTCHours(base.getUTCHours() - 1);
  const yyyy = base.getUTCFullYear();
  const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(base.getUTCDate()).padStart(2, "0");
  const hh = String(base.getUTCHours()).padStart(2, "0");
  return { baseDate: `${yyyy}${mm}${dd}`, baseTime: `${hh}00` };
}

function kmaWeatherText(value?: string) {
  const map: Record<string, string> = { "0": "맑음", "1": "비", "2": "비/눈", "3": "눈", "5": "빗방울", "6": "빗방울/눈날림", "7": "눈날림" };
  return value ? map[value] || value : undefined;
}

async function fetchKma(lat: number, lon: number) {
  const key = process.env.KMA_API_KEY;
  if (!key) return null;
  const { nx, ny } = dfsXyConv(lat, lon);
  const { baseDate, baseTime } = formatKmaBase();
  const url = new URL("https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst");
  url.searchParams.set("serviceKey", key);
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", "1000");
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("base_date", baseDate);
  url.searchParams.set("base_time", baseTime);
  url.searchParams.set("nx", String(nx));
  url.searchParams.set("ny", String(ny));

  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    const json = await res.json();
    const items = json?.response?.body?.items?.item || [];
    const byCat: Record<string, string> = {};
    for (const item of items) byCat[item.category] = item.obsrValue;
    return {
      airTemp: byCat.T1H ? `${byCat.T1H}°C` : undefined,
      windSpeed: byCat.WSD ? `${byCat.WSD}m/s` : undefined,
      weather: kmaWeatherText(byCat.PTY) || "강수 없음",
      humidity: byCat.REH ? `${byCat.REH}%` : undefined,
      source: "기상청 초단기실황",
    };
  } catch {
    return null;
  }
}

async function fetchKhoa(station: Station) {
  const key = process.env.KHOA_API_KEY;
  if (!key) return null;
  const url = new URL("https://www.khoa.go.kr/api/oceangrid/tideObsRecent/search.do");
  url.searchParams.set("ServiceKey", key);
  url.searchParams.set("ObsCode", station.code);
  url.searchParams.set("ResultType", "json");

  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    const json = await res.json();
    const record = json?.result?.data || json?.result || json?.data || null;
    const waterTemp = record?.water_temp || record?.waterTemp || record?.temp || record?.wtemp;
    const salinity = record?.Salinity || record?.salinity;
    const windSpeed = record?.wind_speed || record?.windSpeed;
    const tideLevel = record?.tide_level || record?.tideLevel;
    return {
      waterTemp: waterTemp ? `${waterTemp}°C` : undefined,
      salinity: salinity ? `${salinity}psu` : undefined,
      windSpeed: windSpeed ? `${windSpeed}m/s` : undefined,
      tideLevel: tideLevel ? `${tideLevel}cm` : undefined,
      stationName: station.name,
      source: "국립해양조사원 조위관측소 최신 관측데이터",
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat") || 35.244);
  const lon = Number(searchParams.get("lon") || 129.222);
  const station = nearestStation(Number.isFinite(lat) ? lat : 35.244, Number.isFinite(lon) ? lon : 129.222);

  const [kma, khoa] = await Promise.all([fetchKma(lat, lon), fetchKhoa(station)]);

  const demo = {
    waterTemp: "18.6°C",
    waveHeight: "0.4m",
    windSpeed: "3.2m/s",
    salinity: "33.8psu",
    airTemp: "21°C",
    weather: "강수 없음",
    tideLevel: "확인 중",
  };

  return NextResponse.json({
    ok: Boolean(kma || khoa),
    station: station.name,
    stationDistanceKm: Number(station.distance.toFixed(1)),
    observedAt: new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
    waterTemp: khoa?.waterTemp || demo.waterTemp,
    waveHeight: demo.waveHeight,
    windSpeed: kma?.windSpeed || khoa?.windSpeed || demo.windSpeed,
    salinity: khoa?.salinity || demo.salinity,
    airTemp: kma?.airTemp || demo.airTemp,
    weather: kma?.weather || demo.weather,
    tideLevel: khoa?.tideLevel || demo.tideLevel,
    humidity: kma?.humidity,
    source: {
      marine: khoa?.source || "국립해양조사원 API 연결 대기/대체값",
      weather: kma?.source || "기상청 API 연결 대기/대체값",
    },
    attribution: "기상 정보 제공: 기상청 · 해양 정보 제공: 국립해양조사원",
  });
}
