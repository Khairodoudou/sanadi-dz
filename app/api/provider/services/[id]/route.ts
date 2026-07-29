import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PATCH /api/provider/services/[id] — update a service
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing || existing.providerId !== session.id)
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  const body = await request.json();
  const { name, nameAr, nameFr, category, description, descFr, icon, price, duration, available, wilaya } = body;

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(nameAr !== undefined && { nameAr }),
      ...(nameFr !== undefined && { nameFr }),
      ...(category !== undefined && { category }),
      ...(description !== undefined && { description }),
      ...(descFr !== undefined && { descFr }),
      ...(icon !== undefined && { icon }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(duration !== undefined && { duration: parseInt(duration) }),
      ...(available !== undefined && { available }),
      ...(wilaya !== undefined && { wilaya }),
    },
  });

  return NextResponse.json({ service });
}

// DELETE /api/provider/services/[id] — delete a service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "PROVIDER")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing || existing.providerId !== session.id)
    return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 });

  await prisma.service.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
