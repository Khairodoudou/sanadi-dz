import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalUsers, totalPatients, totalProviders,
    approvedProviders, pendingProviders, suspendedProviders,
    totalServices, activeServices, featuredServices,
    totalRequests, pendingRequests,
    totalAppointments, pendingAppointments, completedAppointments, cancelledAppointments,
    totalRecords, totalPayments, totalReviews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "PATIENT" } }),
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.user.count({ where: { role: "PROVIDER", approved: true, suspended: false } }),
    prisma.user.count({ where: { role: "PROVIDER", approved: false, suspended: false } }),
    prisma.user.count({ where: { role: "PROVIDER", suspended: true } }),
    prisma.service.count(),
    prisma.service.count({ where: { active: true } }),
    prisma.service.count({ where: { featured: true } }),
    prisma.serviceRequest.count(),
    prisma.serviceRequest.count({ where: { status: "PENDING" } }),
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: "PENDING" } }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.medicalRecord.count(),
    prisma.payment.count(),
    prisma.review.count(),
  ]);

  // Auto-sync missing payment records for completed appointments
  const unpayedCompleted = await prisma.appointment.findMany({
    where: { status: "COMPLETED", payment: null },
    include: { service: true },
  });
  for (const apt of unpayedCompleted) {
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

  // Revenue
  const payments = await prisma.payment.findMany({ where: { status: "PAID" } });
  const totalRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const commission = totalRevenue * 0.1;

  // Last 7 days registrations
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d;
  });
  const registrationsChart = await Promise.all(
    last7Days.map(async (date) => {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      const count = await prisma.user.count({ where: { createdAt: { gte: start, lte: end } } });
      return { date: date.toISOString().slice(0, 10), count };
    })
  );

  // Last 7 days bookings
  const bookingsChart = await Promise.all(
    last7Days.map(async (date) => {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      const count = await prisma.appointment.count({ where: { createdAt: { gte: start, lte: end } } });
      return { date: date.toISOString().slice(0, 10), count };
    })
  );

  // Last 7 days revenue
  const revenueChart = await Promise.all(
    last7Days.map(async (date) => {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      const pmts = await prisma.payment.findMany({ where: { status: "PAID", createdAt: { gte: start, lte: end } } });
      return { date: date.toISOString().slice(0, 10), amount: pmts.reduce((a, p) => a + p.amount, 0) };
    })
  );

  // Recent activity
  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }, take: 5,
    select: { id: true, name: true, email: true, role: true, wilaya: true, approved: true, suspended: true, createdAt: true },
  });

  return NextResponse.json({
    users: { total: totalUsers, patients: totalPatients, providers: totalProviders, approvedProviders, pendingProviders, suspendedProviders },
    services: { total: totalServices, active: activeServices, featured: featuredServices },
    requests: { total: totalRequests, pending: pendingRequests },
    appointments: { total: totalAppointments, pending: pendingAppointments, completed: completedAppointments, cancelled: cancelledAppointments },
    records: totalRecords,
    payments: { total: totalPayments, revenue: totalRevenue, commission },
    reviews: totalReviews,
    charts: { registrations: registrationsChart, bookings: bookingsChart, revenue: revenueChart },
    recentUsers,
  });
}
