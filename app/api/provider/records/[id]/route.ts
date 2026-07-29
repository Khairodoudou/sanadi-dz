import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// PATCH /api/provider/records/[id] — update a medical record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.medicalRecord.findUnique({ where: { id } });
  if (!existing || existing.providerId !== session.id)
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  const body = await request.json();

  const record = await prisma.medicalRecord.update({
    where: { id },
    data: {
      ...(body.title         !== undefined && { title: body.title }),
      ...(body.diagnosis     !== undefined && { diagnosis: body.diagnosis }),
      ...(body.history       !== undefined && { history: body.history }),
      ...(body.treatments    !== undefined && { treatments: body.treatments }),
      ...(body.prescriptions !== undefined && { prescriptions: body.prescriptions }),
      ...(body.notes         !== undefined && { notes: body.notes }),
      ...(body.documents     !== undefined && { documents: JSON.stringify(body.documents) }),
      ...(body.labResults    !== undefined && { labResults: body.labResults }),
      ...(body.images        !== undefined && { images: JSON.stringify(body.images) }),
    },
    include: {
      patient: { select: { id: true, name: true } },
    },
  });

  // Notify patient of update
  await createNotification(
    existing.patientId,
    "RECORD_UPDATED",
    `Dr. ${session.name} a mis à jour votre dossier médical : ${record.title}`,
    `/patient/records`
  );

  return NextResponse.json({ record });
}

// DELETE /api/provider/records/[id] — delete a record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.medicalRecord.findUnique({ where: { id } });
  if (!existing || existing.providerId !== session.id)
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  await prisma.medicalRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
