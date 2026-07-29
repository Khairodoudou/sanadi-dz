import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/provider/services — list provider's own services
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const services = await prisma.service.findMany({
    where: { providerId: session.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ services });
}

// POST /api/provider/services — create a new service
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, nameAr, nameFr, category, description, descFr, icon, price, duration, available, wilaya } = body;

  if (!name || !category || !price || !duration)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const service = await prisma.service.create({
    data: {
      name: name || nameFr || "Service",
      nameAr: nameAr || name || "خدمة",
      nameFr: nameFr || name || "Service",
      category,
      description: description || descFr || "",
      descFr: descFr || description || "",
      icon: icon || "🩺",
      price: parseFloat(price),
      duration: parseInt(duration),
      available: available !== false,
      wilaya: wilaya || null,
      providerId: session.id,
    },
  });

  return NextResponse.json({ service }, { status: 201 });
}
