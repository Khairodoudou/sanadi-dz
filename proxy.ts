import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "sanadidz-fallback-secret"
);

const PUBLIC_ROUTES = ["/", "/about", "/contact", "/login", "/signup", "/unauthorized", "/api/auth/login", "/api/auth/signup"];
const ADMIN_ROUTES = ["/admin"];
const PROVIDER_ROUTES = ["/provider"];
const PATIENT_ROUTES = ["/patient", "/services"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return NextResponse.next();
  }

  // Skip static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("sanadidz_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as string;

    // Role-based protection
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (PROVIDER_ROUTES.some((r) => pathname.startsWith(r)) && role !== "PROVIDER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (PATIENT_ROUTES.some((r) => pathname.startsWith(r)) && role !== "PATIENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
