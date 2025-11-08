"use server";

import { signIn } from "@/lib/auth/config";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { AuthError } from "next-auth";

export async function loginAction(email: string, password: string) {
  try {
    // Get IP address from headers for rate limiting
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const ip = forwarded?.split(",")[0] ?? realIp ?? "unknown";

    // Check rate limit before attempting login
    const rateLimitResult = await checkLoginRateLimit(ip);

    if (!rateLimitResult.success) {
      return {
        error: "Zu viele Login-Versuche. Bitte versuchen Sie es in einigen Minuten erneut.",
        rateLimited: true,
      };
    }

    // Attempt login with NextAuth
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return {
        error: "E-Mail oder Passwort ist falsch.",
        rateLimited: false,
      };
    }

    return {
      success: true,
      rateLimited: false,
    };
  } catch (error) {
    // Handle NextAuth errors
    if (error instanceof AuthError) {
      return {
        error: "E-Mail oder Passwort ist falsch.",
        rateLimited: false,
      };
    }

    return {
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      rateLimited: false,
    };
  }
}
