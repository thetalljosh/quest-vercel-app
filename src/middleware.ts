import NextAuth from "next-auth";
import authConfig from "@/features/auth/lib/auth.config";
import { NextResponse } from "next/server";

// Use the edge-compatible config (providers only, no Drizzle adapter)
// so the middleware can run in the Edge Runtime on Vercel.
const { auth } = NextAuth(authConfig);

const PUBLIC_ROUTES = ["/login", "/register", "/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!req.auth && !isPublic && pathname !== "/") {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
