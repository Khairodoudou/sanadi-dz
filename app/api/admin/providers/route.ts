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
  const status = searchParams.get("status") || "ALL";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { role: "PROVIDER" };
  if (status === "PENDING")   { where.approved = false; where.suspended = false; }
  if (status === "VERIFIED")  { where.approved = true;  where.suspended = false; }
  if (status === "SUSPENDED") { where.suspended = true; }
  if (status === "REJECTED")  { where.approved = false; where.adminNotes = { not: null }; }
  if (search) { where.OR = [{ name: { contains: search } }, { email: { contains: search } }]; }

  const [providers, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, phone: true, wilaya: true,
        approved: true, suspended: true, adminNotes: true, avatar: true,
        specialty: true, createdAt: true,
        _count: { select: { providerAppointments: true, ownedServices: true, receivedReviews: true } },
        documents: { select: { id: true, type: true, status: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ providers, total, page, pages: Math.ceil(total / limit) });
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, action, adminNotes } = body;

  if (!id || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  let updateData: Record<string, unknown> = {};
  let auditAction = "";

  switch (action) {
    case "approve":
      updateData = { approved: true, suspended: false };
      auditAction = "PROVIDER_APPROVED";
      break;
    case "reject":
      updateData = { approved: false, adminNotes: adminNotes || "Rejected by admin" };
      auditAction = "PROVIDER_REJECTED";
      break;
    case "suspend":
      updateData = { suspended: true, adminNotes: adminNotes || "Suspended by admin" };
      auditAction = "PROVIDER_SUSPENDED";
      break;
    case "reactivate":
      updateData = { suspended: false };
      auditAction = "PROVIDER_REACTIVATED";
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const updated = await prisma.user.update({ where: { id }, data: updateData });

  await prisma.auditLog.create({
    data: {
      adminId: session.id,
      action: auditAction,
      target: "User",
      targetId: id,
      details: adminNotes || action,
    },
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
    // 1. Get all appointments for this provider
    const appointments = await prisma.appointment.findMany({
      where: { providerId: id },
      select: { id: true },
    });
    const appointmentIds = appointments.map((a) => a.id);

    // 2. Delete messages linked to those appointments
    if (appointmentIds.length > 0) {
      await prisma.message.deleteMany({ where: { appointmentId: { in: appointmentIds } } });
    }

    // 3. Delete reviews linked to those appointments
    if (appointmentIds.length > 0) {
      await prisma.review.deleteMany({ where: { appointmentId: { in: appointmentIds } } });
    }

    // 4. Delete payments linked to those appointments
    if (appointmentIds.length > 0) {
      await prisma.payment.deleteMany({ where: { appointmentId: { in: appointmentIds } } });
    }

    // 5. Delete the appointments themselves
    await prisma.appointment.deleteMany({ where: { providerId: id } });

    // 6. Delete service responses by this provider
    await prisma.serviceResponse.deleteMany({ where: { providerId: id } });

    // 7. Delete medical records where provider
    await prisma.medicalRecord.deleteMany({ where: { providerId: id } });

    // 8. Delete reviews given by this user (as provider)
    await prisma.review.deleteMany({ where: { providerId: id } });

    // 9. Delete notifications
    await prisma.notification.deleteMany({ where: { userId: id } });

    // 10. Delete sent/received messages not covered above
    await prisma.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } });

    // 11. Delete provider documents
    await prisma.providerDocument.deleteMany({ where: { providerId: id } });

    // 12. Unlink owned services (set providerId to null instead of deleting)
    await prisma.service.updateMany({ where: { providerId: id }, data: { providerId: null } });

    // 13. Audit log
    await prisma.auditLog.create({
      data: { adminId: session.id, action: "PROVIDER_DELETED", target: "User", targetId: id },
    });

    // 14. Finally delete the user
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE provider error:", error);
    return NextResponse.json({ error: "Failed to delete provider", details: String(error) }, { status: 500 });
  }
}
