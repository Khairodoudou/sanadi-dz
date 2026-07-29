import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalUsers, totalProviders, totalPatients, totalAppointments, pendingAppointments, completedAppointments] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "PROVIDER" } }),
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
    ]);

  // Appointments per category
  const byCategory = await prisma.appointment.groupBy({
    by: ["serviceId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  const categoryDetails = await Promise.all(
    byCategory.map(async (item) => {
      const service = await prisma.service.findUnique({ where: { id: item.serviceId } });
      return { category: service?.category ?? "Unknown", nameFr: service?.nameFr ?? item.serviceId, count: item._count.id };
    })
  );

  // Last 7 days bookings
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const weeklyBookings = await Promise.all(
    last7Days.map(async (date) => {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      const count = await prisma.appointment.count({ where: { createdAt: { gte: start, lte: end } } });
      return { date: date.toLocaleDateString("fr-DZ", { weekday: "short" }), count };
    })
  );

  return NextResponse.json({
    stats: { totalUsers, totalProviders, totalPatients, totalAppointments, pendingAppointments, completedAppointments },
    categoryData: categoryDetails,
    weeklyBookings,
  });
}
