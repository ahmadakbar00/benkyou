import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type MetaShape = Record<string, Record<string, number[]>>;

export async function GET() {
  const [kotoba, kanji, grammar] = await Promise.all([
    prisma.kotoba.findMany({ select: { level: true, bab: true } }),
    prisma.kanji.findMany({ select: { level: true, bab: true } }),
    prisma.grammar.findMany({ select: { level: true, bab: true } }),
  ]);

  function group(rows: { level: string; bab: number | null }[]) {
    const out: Record<string, number[]> = {};
    for (const r of rows) {
      if (r.bab == null) continue;
      out[r.level] = out[r.level] || [];
      if (!out[r.level].includes(r.bab)) out[r.level].push(r.bab);
    }
    for (const level in out) out[level].sort((a, b) => a - b);
    return out;
  }

  const meta: MetaShape = {
    KOTOBA: group(kotoba),
    KANJI: group(kanji),
    GRAMMAR: group(grammar),
  };

  return NextResponse.json(meta);
}
