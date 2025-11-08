import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { emailSchema } from "@/lib/validation/auth";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const validation = emailSchema.safeParse(email);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Bitte gib eine gültige E-Mail-Adresse an.",
          errors: validation.error.issues.map((issue) => ({
            field: "email",
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const normalizedEmail = validation.data.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json({
        message: "Falls ein Konto existiert, haben wir eine neue E-Mail gesendet.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        message: "Deine E-Mail-Adresse ist bereits bestätigt. Du kannst dich anmelden.",
        alreadyVerified: true,
      });
    }

    const token = crypto.randomUUID();

    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });

    await sendVerificationEmail(normalizedEmail, token);

    return NextResponse.json({
      message: "Wir haben dir eine neue E-Mail zur Bestätigung gesendet.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
