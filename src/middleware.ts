import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get("token");
  const path = request.nextUrl.pathname;

  // Redirect logged-in users from "/" to "/dashboard"
  if (cookie && path === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect non-logged-in users trying to access protected routes
  const protectedRoutes = [
    "/dashboard",
    "/events",
    "/users",
    "/event-planners",
    "/reports",
  ];

  if (!cookie && protectedRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
