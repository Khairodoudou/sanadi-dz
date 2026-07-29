import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// POST /api/service-requests/[id]/respond — provider accepts or refuses
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { action, message } = body; // action: "ACCEPTED" | "REFUSED"

  if (!["ACCEPTED", "REFUSED"].includes(action))
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  // Find the provider's response for this request
  const response = await prisma.serviceResponse.findFirst({
    where: { serviceRequestId: id, providerId: session.id },
    include: {
      serviceRequest: {
        include: { service: { select: { nameFr: true } } },
      },
    },
  });

  if (!response)
    return NextResponse.json({ error: "Response record not found" }, { status: 404 });

  // Update the provider's response
  await prisma.serviceResponse.update({
    where: { id: response.id },
    data: { status: action, message: message || null },
  });

  // If at least one provider accepted, update the request status
  if (action === "ACCEPTED") {
    await prisma.serviceRequest.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });
  }

  // Notify the patient
  const patientId = response.serviceRequest.patientId;
  const serviceName = response.serviceRequest.service.nameFr;
  const providerName = session.name || "Prestataire";

  if (action === "ACCEPTED") {
    await createNotification(
      patientId,
      "REQUEST_ACCEPTED",
      `${providerName} a accepté votre demande pour : ${serviceName}`,
      `/patient/service-requests`
    );
  } else {
    await createNotification(
      patientId,
      "REQUEST_REFUSED",
      `${providerName} a refusé votre demande pour : ${serviceName}`,
      `/patient/service-requests`
    );
  }

  return NextResponse.json({ success: true });
}
