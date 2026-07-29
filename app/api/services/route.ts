import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category  = searchParams.get("category")   || undefined;
  const wilaya    = searchParams.get("wilaya")      || undefined;
  const providerId = searchParams.get("providerId") || undefined;
  const search    = searchParams.get("search")      || undefined;
  const minPrice  = searchParams.get("minPrice")    ? parseFloat(searchParams.get("minPrice")!) : undefined;
  const maxPrice  = searchParams.get("maxPrice")    ? parseFloat(searchParams.get("maxPrice")!) : undefined;

  const services = await prisma.service.findMany({
    where: {
      available: true,
      ...(category   && { category }),
      ...(wilaya     && { wilaya }),
      ...(providerId && { providerId }),
      ...(search     && {
        OR: [
          { name:      { contains: search } },
          { nameFr:    { contains: search } },
          { nameAr:    { contains: search } },
          { category:  { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
    },
    include: {
      provider: {
        select: { id: true, name: true, avatar: true, wilaya: true },
      },
    },
    orderBy: { category: "asc" },
  });

  return NextResponse.json({ services });
}
