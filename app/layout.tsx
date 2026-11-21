import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Nav } from "@/components/Nav";
import { Sidebar } from "@/components/Sidebar";
import { Spotlight } from "@/components/Spotlight";
import { CommandPalette } from "@/components/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crewo",
  description: "Form your crew — hackathons & projects.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <svg width="0" height="0" aria-hidden className="absolute">
          <defs>
            <linearGradient id="crewoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--accent)" />
              <stop offset="1" stopColor="var(--accent-warm)" />
            </linearGradient>
          </defs>
        </svg>
        <Toaster theme="dark" position="top-center" richColors toastOptions={{ style: { background: "var(--surface)", border: "1px solid var(--border-strong)", color: "var(--fg)" } }} />
        <Spotlight />
        <CommandPalette />
        <div className="lg:flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <Nav />
            <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
