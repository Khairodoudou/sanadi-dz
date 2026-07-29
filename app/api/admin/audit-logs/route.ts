import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() { const s = await getSession(); return s?.role === "ADMIN" ? s : null; }

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const action = searchParams.get("action") || "";
  const limit = 30; const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (action) where.action = { contains: action };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where, skip, take: limit, orderBy: { createdAt: "desc" },
      include: { admin: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
}
