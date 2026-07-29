import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status, notes } = await request.json();

  const dataToUpdate: Record<string, unknown> = { status };
  if (notes) dataToUpdate.notes = notes;

  if (session.role === "PROVIDER") {
    dataToUpdate.providerId = session.id;
  }

  // Handle payment status when completed
  if (status === "COMPLETED") {
    const existingPayment = await prisma.payment.findUnique({
      where: { appointmentId: id },
    });
    if (!existingPayment) {
      const aptInfo = await prisma.appointment.findUnique({
        where: { id },
        include: { service: true },
      });
      if (aptInfo) {
        await prisma.payment.create({
          data: {
            appointmentId: id,
            amount: aptInfo.service.price,
            status: "PAID",
            method: "CASH",
          },
        });
      }
    } else if (existingPayment.status !== "PAID") {
      await prisma.payment.update({
        where: { appointmentId: id },
        data: {
          status: "PAID",
          method: existingPayment.method || "CASH",
        },
      });
    }
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: dataToUpdate,
    include: { service: true, patient: { select: { id: true, name: true } }, payment: true },
  });

  // Notify patient of status change
  if (appointment.patient.id !== session.id) {
    await prisma.notification.create({
      data: {
        userId: appointment.patient.id,
        message: `Your appointment for ${appointment.service.nameFr} is now ${status}.`,
      },
    });
  }

  return NextResponse.json({ appointment });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: { select: { id: true, name: true, phone: true, wilaya: true } },
      provider: { select: { id: true, name: true, phone: true } },
      service: true,
    },
  });

  if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ appointment });
}
