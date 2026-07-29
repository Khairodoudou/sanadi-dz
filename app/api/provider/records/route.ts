import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// GET /api/provider/records — list all medical records created by this provider
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const records = await prisma.medicalRecord.findMany({
    where: { providerId: session.id },
    include: {
      patient: { select: { id: true, name: true, email: true, phone: true, avatar: true, wilaya: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ records });
}

// POST /api/provider/records — create a new medical record
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { patientId, title, diagnosis, history, treatments, prescriptions, notes, documents, labResults, images } = body;

  if (!patientId || !title)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  // Verify the patient exists
  const patient = await prisma.user.findUnique({ where: { id: patientId, role: "PATIENT" } });
  if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

  const record = await prisma.medicalRecord.create({
    data: {
      patientId,
      providerId: session.id,
      title,
      diagnosis:     diagnosis     || null,
      history:       history       || null,
      treatments:    treatments    || null,
      prescriptions: prescriptions || null,
      notes:         notes         || null,
      documents:     documents     ? JSON.stringify(documents) : null,
      labResults:    labResults    || null,
      images:        images        ? JSON.stringify(images) : null,
    },
    include: {
      patient: { select: { id: true, name: true } },
    },
  });

  // Notify the patient
  await createNotification(
    patientId,
    "RECORD_UPDATED",
    `Dr. ${session.name} a créé un nouveau dossier médical pour vous : ${title}`,
    `/patient/records`
  );

  return NextResponse.json({ record }, { status: 201 });
}
