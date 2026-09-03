import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  karakter: z.string().min(1),
  onyomi: z.string().optional(),
  kunyomi: z.string().optional(),
  arti: z.string().min(1),
  level: z.enum(["N5", "N4", "N3", "N2", "N1"]).default("N5"),
  bab: z.number().int().optional().nullable(),
});

export async function GET() {
  const list = await prisma.kanji.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const created = await prisma.kanji.create({ data: { ...parsed.data, createdBy: session.user.id } });
  return NextResponse.json(created, { status: 201 });
}
