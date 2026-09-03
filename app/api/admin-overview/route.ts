import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalUsers, totalAdmin, totalKotoba, totalKanji, totalGrammar, totalKana, totalReviewed] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.kotoba.count(),
    prisma.kanji.count(),
    prisma.grammar.count(),
    prisma.kanaChar.count(),
    prisma.userKotobaProgress.count(),
  ]);

  return NextResponse.json({ totalUsers, totalAdmin, totalKotoba, totalKanji, totalGrammar, totalKana, totalReviewed });
}
