import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let where: Record<string, unknown> = {};
  if (session.role === "PATIENT") {
    where = { patientId: session.id };
  } else if (session.role === "PROVIDER") {
    where = {
      OR: [
        { providerId: session.id },
        { providerId: null, status: "PENDING" },
      ],
    };
  }

  if (status) {
    if (where.OR) {
      where = {
        AND: [
          { OR: where.OR as any },
          { status }
        ]
      };
    } else {
      where.status = status;
    }
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: { select: { id: true, name: true, phone: true, wilaya: true } },
      provider: { select: { id: true, name: true, phone: true } },
      service: true,
      payment: true,
      messages: true,
      review: true,
    },
    orderBy: { scheduledAt: "desc" },
  });

  return NextResponse.json({ appointments, currentUserId: session.id });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { serviceId, scheduledAt, address, notes, providerId } = await request.json();
  if (!serviceId || !scheduledAt || !address) {
    return NextResponse.json({ error: "serviceId, scheduledAt and address are required" }, { status: 400 });
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: session.id,
      serviceId,
      scheduledAt: new Date(scheduledAt),
      address,
      notes: notes || null,
      providerId: providerId || null,
    },
    include: { service: true },
  });

  // Create notification for patient
  await prisma.notification.create({
    data: {
      userId: session.id,
      type: "INFO",
      message: `Votre demande de rendez-vous pour ${appointment.service.nameFr} a été soumise.`,
      link: "/patient/bookings",
    },
  });

  // Create notification for targeted provider if selected
  if (providerId) {
    await prisma.notification.create({
      data: {
        userId: providerId,
        type: "NEW_APPOINTMENT",
        message: `Nouveau rendez-vous demandé par ${session.name} pour ${appointment.service.nameFr}`,
        link: "/provider/schedule",
      },
    });
  }

  return NextResponse.json({ appointment }, { status: 201 });
}
