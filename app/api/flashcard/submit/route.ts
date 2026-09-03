import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scheduleWithRating } from "@/lib/fsrs";
import { Rating } from "ts-fsrs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { kotobaId, rating } = await req.json();
  if (![Rating.Again, Rating.Hard, Rating.Good, Rating.Easy].includes(rating)) {
    return NextResponse.json({ error: "rating tidak valid" }, { status: 400 });
  }

  const userId = session.user.id;
  const existing = await prisma.userKotobaProgress.findUnique({
    where: { userId_kotobaId: { userId, kotobaId } },
  });
  const next = scheduleWithRating(existing, rating);

  const saved = await prisma.userKotobaProgress.upsert({
    where: { userId_kotobaId: { userId, kotobaId } },
    update: next,
    create: { userId, kotobaId, ...next },
  });

  const kotoba = await prisma.kotoba.findUnique({ where: { id: kotobaId } });
  await prisma.quizAttempt.create({
    data: {
      userId,
      materiType: "KOTOBA",
      refId: kotobaId,
      bab: kotoba?.bab ?? null,
      level: kotoba?.level ?? "N5",
      benar: rating !== Rating.Again,
      responseMs: 0,
    },
  });

  return NextResponse.json(saved);
}
