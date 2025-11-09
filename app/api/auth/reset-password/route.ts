import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { passwordSchema } from "@/lib/validation/auth";
import { findValidPasswordResetToken } from "@/lib/auth/password-reset";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

const resetSchema = z.object({
  token: z.string().min(1, "Token fehlt."),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  },
);

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsed = resetSchema.safeParse(data);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Eingaben sind ungültig.",
          errors: parsed.error.issues.map((issue) => ({
            field: issue.path[0],
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;

    const tokenRecord = await findValidPasswordResetToken(token);

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Token ist ungültig oder abgelaufen." },
        { status: 400 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      select: { emailVerified: true },
    });

    const passwordHash = await hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
          failedLogins: 0,
          lockedUntil: null,
          emailVerified: currentUser?.emailVerified ?? new Date(),
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: {
          usedAt: new Date(),
        },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: tokenRecord.userId,
          NOT: { id: tokenRecord.id },
        },
      }),
    ]);

    return NextResponse.json({ message: "Passwort wurde aktualisiert. Du kannst dich jetzt anmelden." });
  } catch (error) {
    console.error("[Password Reset] Unexpected error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 },
    );
  }
}
