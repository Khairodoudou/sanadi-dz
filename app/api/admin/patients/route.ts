import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { role: "PATIENT" };
  if (status === "SUSPENDED") where.suspended = true;
  if (status === "ACTIVE")    { where.suspended = false; }
  if (search) where.OR = [{ name: { contains: search } }, { email: { contains: search } }];

  const [patients, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, phone: true, wilaya: true,
        suspended: true, adminNotes: true, avatar: true, createdAt: true,
        _count: { select: { patientAppointments: true, patientRecords: true, serviceRequests: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ patients, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, action, adminNotes } = await req.json();
  if (!id || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  let updateData: Record<string, unknown> = {};
  if (action === "suspend")    updateData = { suspended: true, adminNotes };
  if (action === "reactivate") updateData = { suspended: false };

  const updated = await prisma.user.update({ where: { id }, data: updateData });

  await prisma.auditLog.create({
    data: { adminId: session.id, action: `PATIENT_${action.toUpperCase()}`, target: "User", targetId: id, details: adminNotes },
  });

  return NextResponse.json({ success: true, user: updated });
}

export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    // 1. Get all appointments for this patient
    const appointments = await prisma.appointment.findMany({
      where: { patientId: id },
      select: { id: true },
    });
    const appointmentIds = appointments.map((a) => a.id);

    // 2. Delete messages linked to appointments
    if (appointmentIds.length > 0) {
      await prisma.message.deleteMany({ where: { appointmentId: { in: appointmentIds } } });
    }

    // 3. Delete reviews linked to appointments
    if (appointmentIds.length > 0) {
      await prisma.review.deleteMany({ where: { appointmentId: { in: appointmentIds } } });
    }

    // 4. Delete payments linked to appointments
    if (appointmentIds.length > 0) {
      await prisma.payment.deleteMany({ where: { appointmentId: { in: appointmentIds } } });
    }

    // 5. Delete appointments
    await prisma.appointment.deleteMany({ where: { patientId: id } });

    // 6. Delete medical records
    await prisma.medicalRecord.deleteMany({ where: { patientId: id } });

    // 7. Delete service requests (and their responses)
    const requests = await prisma.serviceRequest.findMany({ where: { patientId: id }, select: { id: true } });
    const requestIds = requests.map((r) => r.id);
    if (requestIds.length > 0) {
      await prisma.serviceResponse.deleteMany({ where: { serviceRequestId: { in: requestIds } } });
      await prisma.serviceRequest.deleteMany({ where: { id: { in: requestIds } } });
    }

    // 8. Delete reviews given by patient
    await prisma.review.deleteMany({ where: { patientId: id } });

    // 9. Delete notifications
    await prisma.notification.deleteMany({ where: { userId: id } });

    // 10. Delete messages sent/received
    await prisma.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });

    // 11. Audit log
    await prisma.auditLog.create({
      data: { adminId: session.id, action: "PATIENT_DELETED", target: "User", targetId: id },
    });

    // 12. Delete user
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE patient error:", error);
    return NextResponse.json({ error: "Failed to delete patient", details: String(error) }, { status: 500 });
  }
}
