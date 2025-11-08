import { auth } from "@/lib/auth/config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Don't block OPTIONS (preflight) or HEAD requests
  if (method === "OPTIONS" || method === "HEAD") {
    return NextResponse.next();
  }

  const isAuthenticated = !!req.auth;
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  const isDashboard = pathname.startsWith("/dashboard");

  // Protect dashboard routes - redirect to sign-in with return URL
  if (isDashboard && !isAuthenticated) {
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages (only for GET requests)
  if (isAuthPage && isAuthenticated && method === "GET") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
