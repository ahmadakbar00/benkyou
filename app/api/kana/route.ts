import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const kanaSchema = z.object({
  karakter: z.string().min(1),
  romaji: z.string().min(1),
  jenis: z.enum(["HIRAGANA", "KATAKANA"]),
  kategori: z.enum(["BASIC", "DAKUTEN", "HANDAKUTEN"]).default("BASIC"),
});

export async function GET() {
  const list = await prisma.kanaChar.findMany({ orderBy: [{ jenis: "asc" }, { kategori: "asc" }] });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = kanaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const created = await prisma.kanaChar.create({ data: parsed.data });
  return NextResponse.json(created, { status: 201 });
}
