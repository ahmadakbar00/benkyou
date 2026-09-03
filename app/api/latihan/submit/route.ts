import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scheduleNext } from "@/lib/fsrs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { materiType, refId, level, bab, benar, responseMs } = await req.json();
  const userId = session.user.id;

  await prisma.quizAttempt.create({
    data: { userId, materiType, refId, level, bab: bab ?? null, benar, responseMs },
  });

  let next;
  if (materiType === "KOTOBA") {
    const existing = await prisma.userKotobaProgress.findUnique({ where: { userId_kotobaId: { userId, kotobaId: refId } } });
    next = scheduleNext(existing, benar, responseMs);
    await prisma.userKotobaProgress.upsert({
      where: { userId_kotobaId: { userId, kotobaId: refId } },
      update: next,
      create: { userId, kotobaId: refId, ...next },
    });
  } else if (materiType === "KANJI") {
    const existing = await prisma.userKanjiProgress.findUnique({ where: { userId_kanjiId: { userId, kanjiId: refId } } });
    next = scheduleNext(existing, benar, responseMs);
    await prisma.userKanjiProgress.upsert({
      where: { userId_kanjiId: { userId, kanjiId: refId } },
      update: next,
      create: { userId, kanjiId: refId, ...next },
    });
  } else if (materiType === "GRAMMAR") {
    const existing = await prisma.userGrammarProgress.findUnique({ where: { userId_grammarId: { userId, grammarId: refId } } });
    next = scheduleNext(existing, benar, responseMs);
    await prisma.userGrammarProgress.upsert({
      where: { userId_grammarId: { userId, grammarId: refId } },
      update: next,
      create: { userId, grammarId: refId, ...next },
    });
  } else {
    return NextResponse.json({ error: "materiType tidak valid" }, { status: 400 });
  }

  return NextResponse.json({ ratingUsed: next.ratingUsed, nextDue: next.due });
}
