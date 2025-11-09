"use server";

import { signIn } from "@/lib/auth/config";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { compare } from "bcryptjs";
import { findUserByIdentifier } from "@/lib/auth/user";

export async function loginAction(identifier: string, password: string, rememberMe = false) {
  const trimmedIdentifier = identifier.trim();
  const normalizedIdentifier = trimmedIdentifier.includes("@")
    ? trimmedIdentifier.toLowerCase()
    : trimmedIdentifier;
  let lastLookupEmail: string | null = null;

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
        error: "Zu viele Login-Versuche. Bitte versuche es in einigen Minuten erneut.",
        rateLimited: true,
      };
    }

    // Prevent login before email verification while keeping error messaging clear
    const user = await findUserByIdentifier(trimmedIdentifier);
    lastLookupEmail = user?.email ?? null;

    if (user && !user.emailVerified) {
      const passwordsMatch = await compare(password, user.passwordHash);

      if (passwordsMatch) {
        return {
          error: "Bitte bestätige zuerst deine E-Mail-Adresse.",
          errorCode: "EMAIL_NOT_VERIFIED",
          pendingEmail: user.email,
          rateLimited: false,
        };
      }
    }

    // Attempt login with NextAuth
    const result = await signIn("credentials", {
      identifier: normalizedIdentifier,
      password,
      rememberMe,
      redirect: false,
    });

    if (result?.error) {
      return {
        error: "E-Mail/Benutzername oder Passwort ist falsch.",
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
      if (error.type === "AccessDenied") {
        return {
          error: "Bitte bestätige zuerst deine E-Mail-Adresse.",
          errorCode: "EMAIL_NOT_VERIFIED",
          pendingEmail: lastLookupEmail ?? trimmedIdentifier.toLowerCase(),
          rateLimited: false,
        };
      }

      return {
        error: "E-Mail/Benutzername oder Passwort ist falsch.",
        rateLimited: false,
      };
    }

    return {
      error: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
      rateLimited: false,
    };
  }
}

