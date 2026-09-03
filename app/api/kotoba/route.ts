import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const kotobaSchema = z.object({
  kanjiKana: z.string().min(1),
  furigana: z.string().optional(),
  romaji: z.string().optional(),
  arti: z.string().min(1),
  contohKalimat: z.string().optional(),
  level: z.enum(["N5", "N4", "N3", "N2", "N1"]).default("N5"),
  bab: z.number().int().optional().nullable(),
});

// GET: semua user boleh lihat daftar kotoba (untuk keperluan lain, mis. browse deck)
export async function GET() {
  const list = await prisma.kotoba.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

// POST: hanya admin yang boleh menambah kartu baru
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = kotobaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const kotoba = await prisma.kotoba.create({
    data: { ...parsed.data, createdBy: session.user.id },
  });
  return NextResponse.json(kotoba, { status: 201 });
}
