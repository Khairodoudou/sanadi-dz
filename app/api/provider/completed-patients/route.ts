import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/provider/completed-patients
// Returns distinct patients that have at least one COMPLETED appointment with this provider
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const appointments = await prisma.appointment.findMany({
    where: {
      providerId: session.id,
      status: "COMPLETED",
    },
    select: {
      patient: {
        select: { id: true, name: true, email: true, phone: true, wilaya: true },
      },
    },
    distinct: ["patientId"],
    orderBy: { scheduledAt: "desc" },
  });

  const patients = appointments.map((a) => a.patient);
  return NextResponse.json({ patients });
}
