import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() { const s = await getSession(); return s?.role === "ADMIN" ? s : null; }

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, message, type, targetRole } = await req.json();
  if (!title || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Create AdminNotification record
  const adminNotif = await prisma.adminNotification.create({
    data: { title, message, type: type || "INFO", targetRole: targetRole || "ALL", sentBy: session.id },
  });

  // Fan out to actual user notifications
  const where: Record<string, unknown> = {};
  if (targetRole === "PATIENT")  where.role = "PATIENT";
  if (targetRole === "PROVIDER") where.role = "PROVIDER";

  const users = await prisma.user.findMany({ where, select: { id: true } });
  await prisma.notification.createMany({
    data: users.map(u => ({
      userId: u.id, type: type || "INFO", message: `[${title}] ${message}`,
    })),
  });

  await prisma.auditLog.create({
    data: { adminId: session.id, action: "NOTIFICATION_SENT", target: "AdminNotification", targetId: adminNotif.id, details: `${targetRole} — ${title}` },
  });

  return NextResponse.json({ success: true, sent: users.length });
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const notifications = await prisma.adminNotification.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ notifications });
}
