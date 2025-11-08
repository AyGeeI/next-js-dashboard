import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { AccessDenied } from "@auth/core/errors";

// Dummy hash for timing attack protection when user doesn't exist
const DUMMY_HASH = "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyGPrY1FeVi2";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Note: PrismaAdapter is NOT compatible with Credentials provider
  // We use JWT sessions but still track lockout data in the database
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input with Zod
        const validationResult = loginSchema.safeParse(credentials);

        if (!validationResult.success) {
          return null;
        }

        const { email, password } = validationResult.data;
        const normalizedEmail = email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

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
          throw new AccessDenied("E-Mail-Adresse wurde noch nicht bestaetigt.");
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
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).username = token.username as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
