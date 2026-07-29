import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/provider/requests — service requests matching this provider
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get current provider details (specialty, wilaya, ownedServices)
  const provider = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      wilaya: true,
      specialty: true,
      ownedServices: { select: { id: true, category: true, nameFr: true, nameAr: true } },
    },
  });

  if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

  const ownedServiceIds = provider.ownedServices.map((s) => s.id);
  const ownedCategories = Array.from(new Set(provider.ownedServices.map((s) => s.category).filter(Boolean)));
  const ownedNamesFr = provider.ownedServices.map((s) => s.nameFr.toLowerCase());
  const ownedNamesAr = provider.ownedServices.map((s) => s.nameAr.toLowerCase());

  // 1. Fetch all responses for this provider
  const allResponses = await prisma.serviceResponse.findMany({
    where: { providerId: session.id },
    include: {
      serviceRequest: {
        include: {
          patient: { select: { id: true, name: true, phone: true, wilaya: true, avatar: true } },
          service: { select: { id: true, name: true, nameFr: true, nameAr: true, icon: true, category: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Strict Filter: Keep ONLY responses matching this provider's domain
  const validResponses: typeof allResponses = [];
  const invalidResponseIds: string[] = [];

  for (const resp of allResponses) {
    const req = resp.serviceRequest;
    if (!req) continue;

    // Check direct assignment
    if (req.providerId === session.id) {
      validResponses.push(resp);
      continue;
    }

    // Check if provider offers this service, category, or specialty
    const isServiceMatch = ownedServiceIds.includes(req.serviceId);
    const isCategoryMatch = ownedCategories.includes(req.service.category);
    const isNameFrMatch = ownedNamesFr.some((n) => req.service.nameFr.toLowerCase().includes(n) || n.includes(req.service.nameFr.toLowerCase()));
    const isNameArMatch = ownedNamesAr.some((n) => req.service.nameAr.toLowerCase().includes(n) || n.includes(req.service.nameAr.toLowerCase()));
    const isSpecialtyMatch = provider.specialty
      ? req.service.nameFr.toLowerCase().includes(provider.specialty.toLowerCase()) ||
        req.service.nameAr.toLowerCase().includes(provider.specialty.toLowerCase())
      : false;

    if (isServiceMatch || isCategoryMatch || isNameFrMatch || isNameArMatch || isSpecialtyMatch) {
      validResponses.push(resp);
    } else {
      // Mark pending unassigned responses that don't match for deletion
      if (resp.status === "PENDING") {
        invalidResponseIds.push(resp.id);
      }
    }
  }

  // 3. Purge invalid pending responses from DB
  if (invalidResponseIds.length > 0) {
    await prisma.serviceResponse.deleteMany({
      where: { id: { in: invalidResponseIds } },
    });
  }

  return NextResponse.json({ responses: validResponses });
}




