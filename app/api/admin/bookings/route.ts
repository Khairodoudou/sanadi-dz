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

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where, skip, take: limit,
      orderBy: { scheduledAt: "desc" },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true } },
        provider: { select: { id: true, name: true, email: true } },
        service: { select: { id: true, nameFr: true, price: true, category: true } },
        payment: { select: { id: true, amount: true, status: true, method: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);
  return NextResponse.json({ appointments, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  const apt = await prisma.appointment.update({ where: { id }, data: { status } });
  await prisma.auditLog.create({
    data: { adminId: session.id, action: "APPOINTMENT_STATUS_CHANGED", target: "Appointment", targetId: id, details: status },
  });
  return NextResponse.json({ appointment: apt });
}
