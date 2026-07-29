import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const s = await getSession();
  return s?.role === "ADMIN" ? s : null;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const featured = searchParams.get("featured");
  const active = searchParams.get("active");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20; const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (featured === "true") where.featured = true;
  if (active === "false")  where.active = false;
  if (search) where.OR = [{ nameFr: { contains: search } }, { name: { contains: search } }];

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      include: { provider: { select: { id: true, name: true, wilaya: true } }, _count: { select: { appointments: true } } },
    }),
    prisma.service.count({ where }),
  ]);
  return NextResponse.json({ services, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const service = await prisma.service.update({ where: { id }, data });
  await prisma.auditLog.create({
    data: { adminId: session.id, action: "SERVICE_UPDATED", target: "Service", targetId: id, details: JSON.stringify(data) },
  });
  return NextResponse.json({ service });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.auditLog.create({
    data: { adminId: session.id, action: "SERVICE_DELETED", target: "Service", targetId: id },
  });
  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
