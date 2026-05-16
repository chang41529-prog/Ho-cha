import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ho-cha",
  description: "연안 생물 기록과 커뮤니티"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ko"><body>{children}</body></html>;
}
