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

  const commissionSetting = await prisma.platformSettings.findUnique({
    where: { key: "platform_commission" },
  });
  const commissionRate = commissionSetting ? parseFloat(commissionSetting.value) || 10 : 10;

  // Auto-sync missing payment records for completed appointments
  const unpayedCompletedApts = await prisma.appointment.findMany({
    where: {
      status: "COMPLETED",
      payment: null,
    },
    include: { service: true },
  });

  for (const apt of unpayedCompletedApts) {
    await prisma.payment.create({
      data: {
        appointmentId: apt.id,
        amount: apt.service.price,
        status: "PAID",
        method: "CASH",
        createdAt: apt.updatedAt || apt.createdAt,
      },
    });
  }

  const [payments, total, paidAggregate] = await Promise.all([
    prisma.payment.findMany({
      skip, take: limit, orderBy: { createdAt: "desc" },
      include: {
        appointment: {
          select: {
            scheduledAt: true,
            patient: { select: { id: true, name: true } },
            provider: { select: { id: true, name: true } },
            service: { select: { nameFr: true, nameAr: true, price: true } },
          },
        },
      },
    }),
    prisma.payment.count(),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  const totalRevenue = paidAggregate._sum.amount || 0;
  const commission = totalRevenue * (commissionRate / 100);

  return NextResponse.json({
    payments,
    total,
    page,
    pages: Math.ceil(total / limit),
    totalRevenue,
    commission,
    commissionRate,
  });
}

