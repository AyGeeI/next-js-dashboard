import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { AccessDenied } from "@auth/core/errors";
import { findUserByIdentifier } from "@/lib/auth/user";

// Dummy hash for timing attack protection when user doesn't exist
const DUMMY_HASH = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyGPrY1FeVi2";
const ROLE_SYNC_INTERVAL_MS = 5 * 1000;
const THIRTY_MINUTES_MS = 30 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Note: PrismaAdapter is NOT compatible with Credentials provider
  // We use JWT sessions but still track lockout data in the database
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "E-Mail oder Benutzername", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("credentials payload", credentials);
        // Validate input with Zod
        const validationResult = loginSchema.safeParse(credentials);

        if (!validationResult.success) {
          return null;
        }

        const { identifier, password, rememberMe } = validationResult.data;
        const trimmedIdentifier = identifier.trim();
        const user = await findUserByIdentifier(trimmedIdentifier);

        // Check account lockout BEFORE password verification
        if (user?.lockedUntil && user.lockedUntil > new Date()) {
          // Account is locked - return null with generic error
          return null;
        }

        // Timing attack protection: Always perform bcrypt.compare
        // even if user doesn't exist (use dummy hash)
        const hashToCompare = user?.passwordHash ?? DUMMY_HASH;
        const passwordsMatch = await compare(password, hashToCompare);

        // Handle failed login
        if (!user || !passwordsMatch) {
          // Increment failed login counter if user exists
          if (user) {
            const failedLogins = user.failedLogins + 1;
            const lockoutThreshold = 10;
            const lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds

            // Lock account if threshold reached
            const lockedUntil = failedLogins >= lockoutThreshold
              ? new Date(Date.now() + lockoutDuration)
              : user.lockedUntil;

            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLogins,
                lockedUntil,
              },
            });
          }

          // Always return null with generic error
          return null;
        }

        if (!user.emailVerified) {
          throw new AccessDenied("E-Mail-Adresse wurde noch nicht bestätigt.");
        }

        // Successful login - reset failed login counter
        if (user.failedLogins > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLogins: 0,
              lockedUntil: null,
            },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          rememberMe: rememberMe ?? false,
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      const now = Date.now();

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.roleSyncedAt = now;
        token.rememberMe = Boolean((user as any).rememberMe);
        token.lastActivity = now;
        return token;
      }

      if (!token.id) {
        return token;
      }

      const rememberMe = Boolean(token.rememberMe);
      const inactivityLimit = rememberMe ? TWENTY_FOUR_HOURS_MS : THIRTY_MINUTES_MS;
      const lastActivity = typeof token.lastActivity === "number" ? token.lastActivity : 0;

      if (lastActivity && now - lastActivity > inactivityLimit) {
        return {};
      }

      const lastSync = typeof token.roleSyncedAt === "number" ? token.roleSyncedAt : 0;
      const shouldRefresh = now - lastSync > ROLE_SYNC_INTERVAL_MS;

      if (shouldRefresh && token.id) {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            email: true,
            name: true,
            username: true,
            role: true,
          },
        });

        if (freshUser) {
          token.email = freshUser.email;
          token.name = freshUser.name;
          token.username = freshUser.username;
          token.role = freshUser.role;
          token.roleSyncedAt = now;
        }
      }

      token.lastActivity = now;
      return token;
    },
    async session({ session, token }) {
      if (!token?.id || !session.user) {
        return session;
      }

      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      (session.user as any).username = token.username as string;
      (session.user as any).role = token.role as string;

      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours, extended via Remember-Me logic in jwt callback
  },
});
