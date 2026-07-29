import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() { const s = await getSession(); return s?.role === "ADMIN" ? s : null; }

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "providers";

  if (type === "providers") {
    const providers = await prisma.user.findMany({
      where: { role: "PROVIDER" },
      select: {
        id: true, name: true, email: true, phone: true, wilaya: true,
        approved: true, suspended: true, specialty: true, createdAt: true,
        _count: { select: { providerAppointments: true, receivedReviews: true } },
      },
    });
    return NextResponse.json({ type, data: providers });
  }

  if (type === "patients") {
    const patients = await prisma.user.findMany({
      where: { role: "PATIENT" },
      select: {
        id: true, name: true, email: true, phone: true, wilaya: true,
        suspended: true, createdAt: true,
        _count: { select: { patientAppointments: true } },
      },
    });
    return NextResponse.json({ type, data: patients });
  }

  if (type === "payments") {
    const payments = await prisma.payment.findMany({
      include: {
        appointment: {
          select: {
            scheduledAt: true,
            patient: { select: { name: true } },
            provider: { select: { name: true } },
            service: { select: { nameFr: true } },
          },
        },
      },
    });
    return NextResponse.json({ type, data: payments });
  }

  if (type === "appointments") {
    const appointments = await prisma.appointment.findMany({
      include: {
        patient: { select: { name: true, wilaya: true } },
        provider: { select: { name: true } },
        service: { select: { nameFr: true, price: true } },
      },
    });
    return NextResponse.json({ type, data: appointments });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
