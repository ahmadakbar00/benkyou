import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { karakter, jenis, benar } = await req.json();
  if (jenis !== "HIRAGANA" && jenis !== "KATAKANA") {
    return NextResponse.json({ error: "jenis harus HIRAGANA atau KATAKANA" }, { status: 400 });
  }

  const updated = await prisma.userKanaProgress.upsert({
    where: { userId_karakter_jenis: { userId: session.user.id, karakter, jenis } },
    update: benar ? { benar: { increment: 1 } } : { salah: { increment: 1 } },
    create: {
      userId: session.user.id,
      karakter,
      jenis,
      benar: benar ? 1 : 0,
      salah: benar ? 0 : 1,
    },
  });

  return NextResponse.json(updated);
}
