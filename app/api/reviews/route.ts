import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appointmentId, rating, comment } = await request.json();
  if (!appointmentId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment || appointment.patientId !== session.id || !appointment.providerId) {
    return NextResponse.json({ error: "Unauthorized or invalid appointment" }, { status: 403 });
  }

  if (appointment.status !== "COMPLETED") {
    return NextResponse.json({ error: "Cannot review incomplete appointment" }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: { appointmentId },
    update: { rating, comment },
    create: {
      appointmentId,
      patientId: session.id,
      providerId: appointment.providerId,
      rating,
      comment,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
