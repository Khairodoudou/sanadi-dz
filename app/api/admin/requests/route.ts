import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() { const s = await getSession(); return s?.role === "ADMIN" ? s : null; }

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "ALL";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20; const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (status !== "ALL") where.status = status;

  const [requests, total] = await Promise.all([
    prisma.serviceRequest.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { id: true, name: true, email: true, wilaya: true } },
        service: { select: { id: true, nameFr: true, category: true } },
        responses: { include: { provider: { select: { id: true, name: true } } } },
      },
    }),
    prisma.serviceRequest.count({ where }),
  ]);
  return NextResponse.json({ requests, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  const req2 = await prisma.serviceRequest.update({ where: { id }, data: { status } });
  await prisma.auditLog.create({
    data: { adminId: session.id, action: "REQUEST_STATUS_CHANGED", target: "ServiceRequest", targetId: id, details: status },
  });
  return NextResponse.json({ request: req2 });
}
