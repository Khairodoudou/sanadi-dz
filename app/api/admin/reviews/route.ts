import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() { const s = await getSession(); return s?.role === "ADMIN" ? s : null; }

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20; const skip = (page - 1) * limit;
  const hidden = searchParams.get("hidden");
  const where: Record<string, unknown> = {};
  if (hidden === "true") where.hidden = true;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where, skip, take: limit, orderBy: { createdAt: "desc" },
      include: {
        patient:  { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } },
        appointment: { select: { scheduledAt: true, service: { select: { nameFr: true } } } },
      },
    }),
    prisma.review.count({ where }),
  ]);
  return NextResponse.json({ reviews, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, hidden } = await req.json();
  const review = await prisma.review.update({ where: { id }, data: { hidden } });
  await prisma.auditLog.create({
    data: { adminId: session.id, action: hidden ? "REVIEW_HIDDEN" : "REVIEW_RESTORED", target: "Review", targetId: id },
  });
  return NextResponse.json({ review });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.auditLog.create({
    data: { adminId: session.id, action: "REVIEW_DELETED", target: "Review", targetId: id },
  });
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
