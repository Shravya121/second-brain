import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const syne = Syne({ subsets: ["latin"], variable: "--font-sans" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Second Brain",
  description: "Your personal AI knowledge base",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
       <body>
  <video
    className="video-bg"
    autoPlay
    muted
    loop
    playsInline
    src="/barins.mp4"
  />
  <div className="app-shell">
    <Sidebar />
    <main className="main-content">{children}</main>
  </div>
</body>
      </html>
    </ClerkProvider>
  );
}
