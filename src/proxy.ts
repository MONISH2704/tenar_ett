import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "tenar_session";

const protectedRoutes = [
  "/",
  "/time-tracking",
  "/attendance",
  "/work-logs",
  "/leave",
  "/profile",
];

const employeeManagementRoutes = [
  "/employees",
];

const adminRoutes = [
  "/managers",
];

const publicRoutes = [
  "/login",
];

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is not configured.");
}

const secretKey = new TextEncoder().encode(secret);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  const isEmployeeManagementRoute =
    employeeManagementRoutes.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(`${route}/`)
    );

  const isAdminRoute = adminRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (
    !isProtectedRoute &&
    !isEmployeeManagementRoute &&
    !isAdminRoute
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(
    COOKIE_NAME
  )?.value;

  if (!token) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  try {
    const { payload } = await jwtVerify(
      token,
      secretKey
    );

    const role = payload.role;

    // Employee management:
    // ADMIN + MANAGER only
    if (isEmployeeManagementRoute) {
      if (
        role !== "ADMIN" &&
        role !== "MANAGER"
      ) {
        return NextResponse.redirect(
          new URL("/", request.url)
        );
      }
    }

    // Manager management:
    // ADMIN only
    if (isAdminRoute) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(
          new URL("/", request.url)
        );
      }
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );

    response.cookies.delete(COOKIE_NAME);

    return response;
  }
}

export const config = {
  matcher: [
    "/",
    "/time-tracking/:path*",
    "/attendance/:path*",
    "/work-logs/:path*",
    "/leave/:path*",
    "/profile/:path*",
    "/employees/:path*",
    "/managers/:path*",
  ],
};