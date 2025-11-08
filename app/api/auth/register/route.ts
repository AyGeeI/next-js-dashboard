import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input with Zod schema
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        { error: "Validierung fehlgeschlagen", errors },
        { status: 400 }
      );
    }

    const { email, password, name, username } = validationResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    // Check for existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Es existiert bereits ein Konto mit dieser E-Mail-Adresse.",
          errors: [{ field: "email", message: "E-Mail wird bereits verwendet." }],
        },
        { status: 400 }
      );
    }

    // Check for existing username
    const existingUsername = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          error: "Dieser Benutzername ist bereits vergeben.",
          errors: [{ field: "username", message: "Benutzername wird bereits verwendet." }],
        },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (cost factor 12 for good security/performance balance)
    const passwordHash = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email: normalizedEmail,
        username: normalizedUsername,
        passwordHash,
        emailVerified: null,
      },
    });

    // Create verification token (valid for 24h)
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

    return NextResponse.json(
      {
        message: "Registrierung erfolgreich. Bitte bestaetige deine E-Mail-Adresse.",
        pendingEmail: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
