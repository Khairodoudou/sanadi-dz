import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appointmentId, amount, method } = await request.json();
  if (!appointmentId || !amount || !method) {
    return NextResponse.json({ error: "appointmentId, amount and method are required" }, { status: 400 });
  }

  // Check if appointment exists and belongs to the patient
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      service: { select: { nameFr: true, nameAr: true } },
      provider: { select: { id: true, name: true } },
    },
  });

  if (!appointment || appointment.patientId !== session.id) {
    return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
  }

  // Check if payment already exists
  const existingPayment = await prisma.payment.findUnique({
    where: { appointmentId },
  });

  if (existingPayment && existingPayment.status === "PAID") {
    return NextResponse.json({ error: "Payment already completed for this appointment" }, { status: 400 });
  }

  // Create or update payment (simulated payment gateway success)
  const payment = await prisma.payment.upsert({
    where: { appointmentId },
    update: { status: "PAID", method, amount },
    create: { appointmentId, amount, method, status: "PAID" },
  });

  // Notify the provider that the session has been paid
  if (appointment.providerId) {
    const methodLabel = method === "EDAHABIA" ? "Edahabia" : "CIB";
    const serviceName = appointment.service.nameFr || appointment.service.nameAr;
    await prisma.notification.create({
      data: {
        userId: appointment.providerId,
        type: "PAYMENT_RECEIVED",
        message: `✅ تم الدفع: ${session.name} دفع ${amount.toLocaleString()} DZD لـ "${serviceName}" عبر ${methodLabel}`,
        link: "/provider/requests",
      },
    });
  }

  return NextResponse.json({ payment }, { status: 201 });
}
