import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, phone: true, wilaya: true, approved: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, phone, wilaya } = await request.json();

  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(wilaya !== undefined && { wilaya }),
    },
    select: { id: true, name: true, email: true, role: true, phone: true, wilaya: true },
  });

  return NextResponse.json({ user });
}

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("sanadidz_token", "", { maxAge: 0, path: "/" });
  return response;
}
