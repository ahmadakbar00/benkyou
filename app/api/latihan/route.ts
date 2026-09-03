import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const tipeParam = (url.searchParams.get("tipe") || "KOTOBA,KANJI,GRAMMAR").split(",");
  const level = url.searchParams.get("level"); // "N5" atau null (semua level)
  const babParam = url.searchParams.get("bab"); // "1,2,3" atau null
  const jumlahParam = url.searchParams.get("jumlah");
  const jumlah = jumlahParam === "semua" ? null : parseInt(jumlahParam || "10", 10);
  const babList = babParam ? babParam.split(",").map(Number) : null;
  const now = new Date();

  const items: any[] = [];

  async function ambilKotoba() {
    const where: any = {};
    if (level) where.level = level;
    if (babList) where.bab = { in: babList };
    const list = await prisma.kotoba.findMany({ where });
    const progress = await prisma.userKotobaProgress.findMany({ where: { userId: session!.user.id } });
    const map = new Map(progress.map((p) => [p.kotobaId, p]));

    for (const k of list) {
      const p = map.get(k.id);
      const due = !p || p.due <= now;
      if (babList || due) {
        items.push({
          materiType: "KOTOBA", refId: k.id, level: k.level, bab: k.bab,
          tanya: k.kanjiKana, jawaban: k.arti, hint: k.furigana || k.romaji || "",
        });
      }
    }
  }

  async function ambilKanji() {
    const where: any = {};
    if (level) where.level = level;
    if (babList) where.bab = { in: babList };
    const list = await prisma.kanji.findMany({ where });
    const progress = await prisma.userKanjiProgress.findMany({ where: { userId: session!.user.id } });
    const map = new Map(progress.map((p) => [p.kanjiId, p]));

    for (const k of list) {
      const p = map.get(k.id);
      const due = !p || p.due <= now;
      if (babList || due) {
        items.push({
          materiType: "KANJI", refId: k.id, level: k.level, bab: k.bab,
          tanya: k.karakter, jawaban: k.arti, hint: [k.onyomi, k.kunyomi].filter(Boolean).join(" / "),
        });
      }
    }
  }

  async function ambilGrammar() {
    const where: any = {};
    if (level) where.level = level;
    if (babList) where.bab = { in: babList };
    const list = await prisma.grammar.findMany({ where });
    const progress = await prisma.userGrammarProgress.findMany({ where: { userId: session!.user.id } });
    const map = new Map(progress.map((p) => [p.grammarId, p]));

    for (const g of list) {
      const p = map.get(g.id);
      const due = !p || p.due <= now;
      if (babList || due) {
        items.push({
          materiType: "GRAMMAR", refId: g.id, level: g.level, bab: g.bab,
          tanya: g.pola, jawaban: g.arti || g.penjelasan, hint: g.contohKalimat || "",
        });
      }
    }
  }

  const tasks = [];
  if (tipeParam.includes("KOTOBA")) tasks.push(ambilKotoba());
  if (tipeParam.includes("KANJI")) tasks.push(ambilKanji());
  if (tipeParam.includes("GRAMMAR")) tasks.push(ambilGrammar());
  await Promise.all(tasks);

  const acak = shuffle(items);
  const hasil = jumlah ? acak.slice(0, jumlah) : acak;

  return NextResponse.json(hasil);
}
