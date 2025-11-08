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
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages (only for GET requests)
  if (isAuthPage && isAuthenticated && method === "GET") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("from");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
