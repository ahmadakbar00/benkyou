import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progresses = await prisma.userKotobaProgress.findMany({
    where: { userId: session.user.id },
    include: { kotoba: true },
  });

  const totalCards = progresses.length;
  const matured = progresses.filter((p) => p.state === 2).length; // state 2 = Review (FSRS)
  const learning = totalCards - matured;

  // distribusi jumlah kartu per level (N5-N1) untuk bar chart
  const byLevel: Record<string, number> = {};
  for (const p of progresses) {
    byLevel[p.kotoba.level] = (byLevel[p.kotoba.level] || 0) + 1;
  }

  // progress harian 14 hari terakhir berdasarkan lastReview, untuk line chart
  const days: { date: string; direview: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = progresses.filter(
      (p) => p.lastReview && p.lastReview.toISOString().slice(0, 10) === dateStr
    ).length;
    days.push({ date: dateStr, direview: count });
  }

  const kana = await prisma.userKanaProgress.findMany({
    where: { userId: session.user.id },
  });
  const hiraganaStats = kana.filter((k) => k.jenis === "HIRAGANA");
  const katakanaStats = kana.filter((k) => k.jenis === "KATAKANA");

  const sumBenar = (arr: typeof kana) => arr.reduce((sum, k) => sum + k.benar, 0);
  const sumSalah = (arr: typeof kana) => arr.reduce((sum, k) => sum + k.salah, 0);

  return NextResponse.json({
    totalCards,
    matured,
    learning,
    byLevel,
    dailyProgress: days,
    hiragana: { totalBenar: sumBenar(hiraganaStats), totalSalah: sumSalah(hiraganaStats) },
    katakana: { totalBenar: sumBenar(katakanaStats), totalSalah: sumSalah(katakanaStats) },
  });
}
