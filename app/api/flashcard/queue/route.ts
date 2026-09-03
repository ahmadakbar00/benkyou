import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allKotoba = await prisma.kotoba.findMany();
  const progresses = await prisma.userKotobaProgress.findMany({ where: { userId: session.user.id } });
  const progressMap = new Map(progresses.map((p) => [p.kotobaId, p]));

  const now = new Date();
  const due = allKotoba.filter((k) => {
    const p = progressMap.get(k.id);
    if (!p) return true;
    return p.due <= now;
  });

  return NextResponse.json(due);
}
