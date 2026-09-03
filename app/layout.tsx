import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nihongo SRS - Belajar Bahasa Jepang",
  description: "Belajar hiragana dan kosakata Jepang dengan spaced repetition",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
