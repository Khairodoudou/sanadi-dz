import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20; const skip = (page - 1) * limit;

  // Admin can only see metadata — no medical content fields
  const [records, total] = await Promise.all([
    prisma.medicalRecord.findMany({
      skip, take: limit,
      orderBy: { date: "desc" },
      select: {
        id: true, title: true, date: true, updatedAt: true,
        patient: { select: { id: true, name: true, wilaya: true } },
        provider: { select: { id: true, name: true, specialty: true } },
        // NO: diagnosis, history, treatments, prescriptions, notes, documents, labResults, images
      },
    }),
    prisma.medicalRecord.count(),
  ]);

  // Log every access to medical records by admin
  await prisma.auditLog.create({
    data: {
      adminId: session.id,
      action: "RECORDS_LIST_VIEWED",
      target: "MedicalRecord",
      details: `Page ${page} viewed — metadata only`,
    },
  });

  return NextResponse.json({ records, total, page, pages: Math.ceil(total / limit) });
}
