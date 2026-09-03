import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Tidak bisa ubah role sendiri" }, { status: 400 });
  }
  const { role } = await req.json();
  if (role !== "ADMIN" && role !== "USER") {
    return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
  }
  const updated = await prisma.user.update({ where: { id: params.id }, data: { role } });
  return NextResponse.json({ id: updated.id, role: updated.role });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Tidak bisa hapus akun sendiri" }, { status: 400 });
  }
  // Hapus data terkait dulu supaya tidak melanggar foreign key
  await prisma.userKotobaProgress.deleteMany({ where: { userId: params.id } });
  await prisma.userKanaProgress.deleteMany({ where: { userId: params.id } });
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
