import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const appointmentId = searchParams.get("appointmentId");

  if (!appointmentId) {
    return NextResponse.json({ error: "appointmentId required" }, { status: 400 });
  }

  // Ensure the user is part of the appointment
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!appointment || (appointment.patientId !== session.id && appointment.providerId !== session.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  return NextResponse.json({ messages: appointment.messages });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { appointmentId, content } = await request.json();
  if (!appointmentId || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
  });

  if (!appointment || !appointment.providerId) {
    return NextResponse.json({ error: "Invalid appointment or no provider assigned" }, { status: 400 });
  }

  if (appointment.patientId !== session.id && appointment.providerId !== session.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const receiverId = session.id === appointment.patientId ? appointment.providerId : appointment.patientId;

  const message = await prisma.message.create({
    data: {
      appointmentId,
      content,
      senderId: session.id,
      receiverId,
    },
  });

  return NextResponse.json({ message }, { status: 201 });
}
