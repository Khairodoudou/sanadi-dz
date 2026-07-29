import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotificationMany } from "@/lib/notifications";

// GET /api/service-requests — patient's own requests
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requests = await prisma.serviceRequest.findMany({
    where: { patientId: session.id },
    include: {
      service: { select: { id: true, name: true, nameFr: true, nameAr: true, icon: true, category: true } },
      responses: {
        include: { provider: { select: { id: true, name: true, avatar: true, wilaya: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}

// POST /api/service-requests — create a new service request (patient)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PATIENT")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { serviceId, providerId, description, address, scheduledAt, urgency } = body;

  if (!serviceId || !description || !address || !scheduledAt)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  let providerIds: string[] = [];

  if (providerId) {
    providerIds = [providerId];
  } else {
    const targetService = await prisma.service.findUnique({ where: { id: serviceId } });

    const matchingProviders = await prisma.user.findMany({
      where: {
        role: "PROVIDER",
        OR: [
          { ownedServices: { some: { id: serviceId } } },
          { ownedServices: { some: { category: targetService?.category || "" } } },
        ],
      },
      select: { id: true },
    });

    providerIds = matchingProviders.map((p) => p.id);

    if (providerIds.length === 0) {
      const allProviders = await prisma.user.findMany({
        where: { role: "PROVIDER" },
        select: { id: true },
      });
      providerIds = allProviders.map((p) => p.id);
    }
  }

  // Create the service request
  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      patientId: session.id,
      serviceId,
      providerId: providerId || null,
      description,
      address,
      scheduledAt: new Date(scheduledAt),
      urgency: urgency || "NORMAL",
      status: "PENDING",
      responses: {
        create: providerIds.map((pId) => ({
          providerId: pId,
          status: "PENDING",
        })),
      },
    },
    include: {
      service: true,
      responses: { include: { provider: { select: { name: true } } } },
    },
  });

  // Notify all relevant providers
  if (providerIds.length > 0) {
    const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { nameFr: true } });
    await createNotificationMany(
      providerIds,
      "NEW_REQUEST",
      `Nouvelle demande de service : ${service?.nameFr || "Service"} — ${session.name || "Patient"}`,
      `/provider/service-requests`
    );
  }

  return NextResponse.json({ serviceRequest }, { status: 201 });
}
